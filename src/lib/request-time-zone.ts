import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isValidTimeZone, TIME_ZONE_COOKIE } from "@/lib/time-zone";

/** The viewer's time zone, or undefined to fall back to the server's own time zone. */
export const getTimeZone = cache(async (): Promise<string | undefined> => {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return isValidTimeZone(value) ? value : undefined;
});
