// Backward-compat alias for the old waitlist endpoint.
// All logic lives in /api/contact.
export const runtime = "nodejs";
export { POST } from "../contact/route";
