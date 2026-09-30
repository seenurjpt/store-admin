"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useColorScheme } from "@mui/material/styles";

// Lives in the root layout, so toasts survive client-side navigation
// (e.g. "Product created" is still visible on the product page after the redirect).
export function Toaster() {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (mode === "system" ? systemMode : mode) ?? "light";

  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedMode}
      toastOptions={{ style: { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" } }}
    />
  );
}
