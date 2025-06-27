"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
// import ratelimit from "../ratelimit"; // 👈 comment this out if not used
import { redirect } from "next/navigation";

export const signInWithCredentials = async (params: Pick<AuthCredentials, "email" | "password">) => {
  const { email, password } = params;

  // ✅ Corrected header key
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";

  // ✅ TEMPORARILY DISABLE Upstash (to prevent crash in Pakistan)
  // const { success } = await ratelimit.limit(ip);
  const success = true;

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "SignIn error");
    return { success: false, error: "SignIn error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";

  // ✅ TEMPORARILY DISABLE Upstash (same here)
  // const { success } = await ratelimit.limit(ip);
  const success = true;

  if (!success) return redirect("/too-fast");

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};
