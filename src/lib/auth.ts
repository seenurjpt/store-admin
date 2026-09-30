import "server-only";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, decryptSession } from "@/lib/session";
import type { Role } from "@/generated/prisma/enums";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

// Compared against when the email is unknown, so both paths take roughly the same time.
const DUMMY_HASH = "$2b$10$wfP367QPkisJCOrAtVZXOOfSlRvWSiwwmQqsGQ8HV4zideLEsev6G";

/**
 * Returns the logged-in user, or null. The user (and their role) is loaded from the
 * database on every request, so deleted users or role changes take effect immediately.
 * Wrapped in React `cache` so it only hits the database once per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function verifyCredentials(email: string, password: string): Promise<CurrentUser | null> {
  const user = await db.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
