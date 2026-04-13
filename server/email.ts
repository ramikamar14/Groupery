import { db } from "./db";
import { emailQueue } from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";
import { pool } from "./db";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Grouperry <noreply@grouperry.com>";

function isResendConfigured(): boolean {
  return !!(RESEND_API_KEY && RESEND_API_KEY.startsWith("re_"));
}

export async function sendViaResend(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: body };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

function buildEmailTemplate(emailType: string, payload: any): { subject: string; html: string } | null {
  const listingTitle = payload?.listingTitle || "your group deal";
  const listingId = payload?.listingId;
  const baseUrl = process.env.APP_ORIGIN ?? "https://grouperry.com";
  const listingUrl = listingId ? `${baseUrl}/listings/${listingId}` : baseUrl;

  const wrapHtml = (title: string, body: string) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 24px; }
      .card { background: white; border-radius: 12px; padding: 32px; max-width: 480px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .logo { font-size: 20px; font-weight: 700; color: #6d28d9; margin-bottom: 24px; }
      h2 { font-size: 18px; font-weight: 600; color: #111; margin: 0 0 12px; }
      p { color: #555; line-height: 1.6; margin: 0 0 16px; font-size: 14px; }
      .cta { display: inline-block; background: #6d28d9; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 8px; }
      .footer { margin-top: 24px; color: #999; font-size: 12px; }
    </style></head>
    <body><div class="card">
      <div class="logo">Grouperry</div>
      <h2>${title}</h2>
      ${body}
      <div class="footer">You received this because you joined Grouperry. <a href="${baseUrl}" style="color:#6d28d9">grouperry.com</a></div>
    </div></body></html>
  `;

  switch (emailType) {
    case "group_completion":
      return {
        subject: `🎉 Group complete — "${listingTitle}"`,
        html: wrapHtml(
          "Your group deal is complete!",
          `<p>All slots have been filled for <strong>${listingTitle}</strong>. The organizer will now collect payments and place the bulk order.</p>
           <p>Watch the group chat for instructions from the organizer on next steps.</p>
           <a href="${listingUrl}" class="cta">View Deal</a>`
        ),
      };

    case "group_commit_confirmed":
      return {
        subject: `✅ Commitment confirmed — "${listingTitle}"`,
        html: wrapHtml(
          "You're in the group!",
          `<p>Your commitment to <strong>${listingTitle}</strong> has been confirmed. You'll be notified when the group is complete and the organizer has collected payments.</p>
           <a href="${listingUrl}" class="cta">View Deal</a>`
        ),
      };

    case "milestone_advanced":
      return {
        subject: `📦 Deal update — "${listingTitle}"`,
        html: wrapHtml(
          `Deal update: ${payload?.stageName || "New stage reached"}`,
          `<p>The organizer of <strong>${listingTitle}</strong> has marked a new milestone as complete: <strong>${payload?.stageName || "Next stage"}</strong>.</p>
           <p>${payload?.notes ? `Organizer note: "${payload.notes}"` : "Check the deal page for the latest progress."}</p>
           <a href="${listingUrl}" class="cta">View Deal Progress</a>`
        ),
      };

    case "expiry_warning":
      return {
        subject: `⏰ Expiring soon — "${listingTitle}"`,
        html: wrapHtml(
          "This deal expires in 24 hours",
          `<p><strong>${listingTitle}</strong> is closing in less than 24 hours. If you haven't committed yet, now is the time.</p>
           <p>Only <strong>${payload?.slotsLeft ?? "a few"}</strong> slot${payload?.slotsLeft === 1 ? "" : "s"} remaining.</p>
           <a href="${listingUrl}" class="cta">Join Before It Expires</a>`
        ),
      };

    case "verification_update":
      return {
        subject: `Your verification status has been updated`,
        html: wrapHtml(
          `Verification ${payload?.status === "verified" ? "approved" : "update"}`,
          `<p>Your account verification status has been updated to: <strong>${payload?.status}</strong>.</p>
           ${payload?.status === "verified" ? `<p>You can now create listings and participate in group deals on Grouperry.</p>` : ""}
           <a href="${baseUrl}" class="cta">Go to Grouperry</a>`
        ),
      };

    case "new_announcement":
      return {
        subject: `📢 New announcement in "${listingTitle}"`,
        html: wrapHtml(
          "New announcement from the organizer",
          `<p>The organizer of <strong>${listingTitle}</strong> posted a new announcement:</p>
           <blockquote style="border-left: 3px solid #6d28d9; padding-left: 12px; color: #333; margin: 12px 0;">${payload?.content || "Check the deal page for details."}</blockquote>
           <a href="${listingUrl}" class="cta">View Announcement</a>`
        ),
      };

    case "saved_search_alert":
      return {
        subject: `🔔 New deal matches your saved search`,
        html: wrapHtml(
          "A new deal matches your search",
          `<p>A new listing matching your saved search <strong>"${payload?.searchQuery || "your search"}"</strong> has been posted: <strong>${listingTitle}</strong>.</p>
           <a href="${listingUrl}" class="cta">View Deal</a>`
        ),
      };

    default:
      return null;
  }
}

export async function processEmailQueue(limit = 20): Promise<{ processed: number; failed: number }> {
  if (!isResendConfigured()) {
    return { processed: 0, failed: 0 };
  }

  const pending = await db.select({ id: emailQueue.id, userId: emailQueue.userId, emailType: emailQueue.emailType, payload: emailQueue.payload, retryCount: emailQueue.retryCount })
    .from(emailQueue)
    .where(and(eq(emailQueue.status, "pending")))
    .limit(limit);

  let processed = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const [user] = await db.select({ email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.id, entry.userId));

      if (!user?.email) {
        await pool.query(`UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = $1`, [entry.id]);
        failed++;
        continue;
      }

      const template = buildEmailTemplate(entry.emailType, entry.payload);
      if (!template) {
        await pool.query(`UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = $1`, [entry.id]);
        failed++;
        continue;
      }

      const result = await sendViaResend(user.email, template.subject, template.html);
      if (result.ok) {
        await pool.query(`UPDATE email_queue SET status = 'sent', processed_at = NOW() WHERE id = $1`, [entry.id]);
        processed++;
      } else {
        // Retry up to 3 times before marking as permanently failed
        if ((entry.retryCount ?? 0) < 3) {
          await pool.query(`UPDATE email_queue SET retry_count = retry_count + 1 WHERE id = $1`, [entry.id]);
        } else {
          await pool.query(`UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = $1`, [entry.id]);
        }
        failed++;
      }
    } catch {
      if ((entry.retryCount ?? 0) < 3) {
        await pool.query(`UPDATE email_queue SET retry_count = retry_count + 1 WHERE id = $1`, [entry.id]);
      } else {
        await pool.query(`UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = $1`, [entry.id]);
      }
      failed++;
    }
  }

  return { processed, failed };
}

export { isResendConfigured };
