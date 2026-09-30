const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const number = new Intl.NumberFormat("en-US");

export const formatPrice = (value: number) => currency.format(value);
export const formatNumber = (value: number) => number.format(value);

// `timeZone` is the viewer's time zone (see lib/request-time-zone.ts); undefined uses the server's.
export const formatDate = (value: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone }).format(value);

export const formatDateTime = (value: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone }).format(value);
