/** Split a full name into HubSpot-style first/last (last word = last name). */
export function nameParts(full: string): { firstname?: string; lastname?: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstname: parts[0] };
  return { firstname: parts.slice(0, -1).join(" "), lastname: parts[parts.length - 1] };
}
