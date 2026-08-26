// Helper: format a South African phone number as user types
export function formatZaPhone(value: string): string {
  // Strip any non-digit, non-+ characters
  let cleaned = value.replace(/[^\d+]/g, "");

  // If international format with +27
  if (cleaned.startsWith("+27")) {
    const rest = cleaned.replace("+27", "").replace(/^0/, "");
    const local = formatLocalDigits(rest);
    return `+27 ${local}`;
  }

  // If starts with 27 (no plus)
  if (cleaned.startsWith("27") && cleaned.length > 2) {
    const rest = cleaned.replace(/^27/, "").replace(/^0/, "");
    const local = formatLocalDigits(rest);
    return `+27 ${local}`;
  }

  // Local format: 0XX XXX XXXX
  if (cleaned.startsWith("0")) {
    return formatLocalDigits(cleaned);
  }

  // Anything else - just format digits in groups of 3
  return formatLocalDigits(cleaned);
}

function formatLocalDigits(digits: string): string {
  // Reject empty
  if (!digits) return "";

  // If starts with 0, group as 0XX XXX XXXX (up to 10 digits)
  if (digits.startsWith("0")) {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
  }

  // Otherwise group by 3s up to 9 digits (for +27 local part)
  const d = digits.slice(0, 9);
  const parts: string[] = [];
  for (let i = 0; i < d.length; i += 3) {
    parts.push(d.slice(i, i + 3));
  }
  return parts.join(" ");
}