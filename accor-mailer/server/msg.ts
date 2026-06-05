import type { MsgParseResult } from "../shared/types.js";

export async function parseMsgFile(buffer: Buffer): Promise<MsgParseResult> {
  try {
    // Dynamic import so missing module doesn't crash the whole server
    const { default: MsgReader } = await import("@kenjiuno/msgreader");
    const reader = new MsgReader(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
    const data = reader.getFileData();

    const subject = (data as any).subject ?? "";
    let html = (data as any).bodyHtml ?? "";
    const plainBody = (data as any).body ?? "";

    if (!html && plainBody) {
      html = `<pre style="font-family:inherit;white-space:pre-wrap;">${plainBody
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`;
    }

    const fromEmail = (data as any).senderEmail ?? "";
    const fromName = (data as any).senderName ?? "";

    return { subject, html, fromEmail, fromName };
  } catch (err) {
    throw new Error(
      `Failed to parse .msg file: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
