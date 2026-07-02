/**
 * Normalise any phone number to E.164 so Twilio accepts international numbers
 * and so the same phone always maps to the same users row regardless of how
 * the user typed it (+20..., 0020..., 020..., 20... → +20...).
 */
export function toE164(raw: string): string {
  const s = raw.trim().replace(/[\s\-().]/g, "");
  if (s.startsWith("+")) return s;           // already E.164
  if (s.startsWith("00")) return "+" + s.slice(2); // 00201... → +201...
  // Local format (leading 0) without country code — cannot reliably auto-prefix,
  // so just prepend + and let Twilio reject with a clear error.
  if (s.startsWith("0")) return "+" + s.slice(1);
  return "+" + s;
}
