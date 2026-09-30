import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { AppShell } from "@/components/app-shell";

// `modal` is the @modal slot: create/edit product dialogs opened over the current page.
export default async function AppLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const user = await requireUser();
  const sidebarCollapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <AppShell user={user} defaultCollapsed={sidebarCollapsed}>
      {children}
      {modal}
    </AppShell>
  );
}
