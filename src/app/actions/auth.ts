"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export type LoginState =
  | {
      error?: string;
      fieldErrors?: { email?: string[]; password?: string[] };
      email?: string;
    }
  | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: String(formData.get("password") ?? "") });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, email };
  }

  let user;
  try {
    user = await verifyCredentials(parsed.data.email, parsed.data.password);
  } catch (error) {
    console.error("Login failed", error);
    return { error: "We couldn't sign you in right now. Please try again in a moment.", email };
  }

  if (!user) {
    return { error: "Invalid email or password.", email };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
