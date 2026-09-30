// The browser stores its time zone in this cookie (see components/time-zone-cookie.tsx) so that
// Server Components can format dates in the viewer's local time.
export const TIME_ZONE_COOKIE = "tz";

/** The cookie is user-controlled, so only accept time zones that Intl actually knows. */
export function isValidTimeZone(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
