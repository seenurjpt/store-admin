"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TIME_ZONE_COOKIE } from "@/lib/time-zone";

/**
 * Saves the browser's time zone in a cookie so the server can render dates in local time.
 * It normally runs on the login page, before any dates are shown. If the cookie was missing or
 * out of date on a page that shows dates, the page is refreshed once so those dates are corrected.
 */
export function TimeZoneCookie() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return;

    const saved = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);
    if (saved === timeZone) return;

    document.cookie = `${TIME_ZONE_COOKIE}=${timeZone}; path=/; max-age=31536000; samesite=lax`;

    // The login page shows no dates, so there is nothing to correct. Refreshing it would also race
    // with a quick login: the redirect to /dashboard could be cut off and stay stuck loading.
    if (pathname !== "/login") router.refresh();
  }, [router, pathname]);

  return null;
}
