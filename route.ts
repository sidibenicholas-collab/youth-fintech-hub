import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Find user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const user = userResult[0];

    // Verify password
    const isPasswordCorrect = verifyPassword(password, user.salt, user.passwordHash);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    // Create session & cookies
    await createSession(user.id);

    // Return user info
    const { passwordHash: _, salt: __, ...userProfile } = user;
    return NextResponse.json(userProfile);
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
