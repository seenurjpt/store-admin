import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import theme from "@/theme";
import { TimeZoneCookie } from "@/components/time-zone-cookie";
import { Toaster } from "@/components/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · Store Admin",
    default: "Store Admin",
  },
  description: "Management panel for the online store",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The color scheme class is added to <html> before hydration, hence suppressHydrationWarning.
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body>
        {/* Applies the saved light/dark choice before first paint, so the page never flashes. */}
        <InitColorSchemeScript attribute="class" defaultMode="light" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="light">
            <CssBaseline />
            {children}
            <Toaster />
            <TimeZoneCookie />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
