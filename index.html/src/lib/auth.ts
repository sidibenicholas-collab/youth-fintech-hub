import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Secure password hashing using native crypto
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const newHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(newHash, "hex"));
}

// Session management
export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set("quest_forge_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("quest_forge_session")?.value;

    if (!token) return null;

    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, token))
      .limit(1);

    if (sessionResult.length === 0) return null;

    const session = sessionResult[0];

    // Check expiration
    if (new Date() > session.expiresAt) {
      await db.delete(sessions).where(eq(sessions.id, token));
      const cookieStore2 = await cookies();
      cookieStore2.delete("quest_forge_session");
      return null;
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) return null;

    return userResult[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("quest_forge_session")?.value;

    if (token) {
      await db.delete(sessions).where(eq(sessions.id, token));
    }

    const cookieStore2 = await cookies();
    cookieStore2.delete("quest_forge_session");
    return true;
  } catch (error) {
    console.error("Error destroying session:", error);
    return false;
  }
}
