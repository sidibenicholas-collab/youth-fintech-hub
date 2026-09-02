import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userBossQuests, userHistoryLogs } from "@/db/schema";
import { generateSalt, hashPassword, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, characterClass } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username, and password are required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // RPG Initial Stats based on class
    let maxHp = 50;
    let gold = 20;
    const selectedClass = characterClass || "Warrior";

    if (selectedClass === "Warrior") {
      maxHp = 65;
    } else if (selectedClass === "Mage") {
      maxHp = 40;
      gold = 30; // Starts with a bit more gold
    } else if (selectedClass === "Rogue") {
      maxHp = 45;
    } else if (selectedClass === "Cleric") {
      maxHp = 50;
    }

    // Default Avatar Config based on class
    let avatarConfig = '{"hair":"spiky","hairColor":"brown","skin":"fair","outfit":"apprentice"}';
    if (selectedClass === "Warrior") {
      avatarConfig = '{"hair":"buzzcut","hairColor":"black","skin":"fair","outfit":"chainmail"}';
    } else if (selectedClass === "Mage") {
      avatarConfig = '{"hair":"long","hairColor":"silver","skin":"fair","outfit":"robes"}';
    } else if (selectedClass === "Rogue") {
      avatarConfig = '{"hair":"hooded","hairColor":"dark","skin":"tan","outfit":"leather"}';
    } else if (selectedClass === "Cleric") {
      avatarConfig = '{"hair":"neat","hairColor":"blonde","skin":"fair","outfit":"vestments"}';
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: emailLower,
        username: username.trim(),
        passwordHash,
        salt,
        class: selectedClass,
        level: 1,
        xp: 0,
        xpNeeded: 100,
        hp: maxHp,
        maxHp,
        gold,
        avatarConfig,
      })
      .returning();

    // Set initial Boss Quest (Snail of Sloth is active by default)
    await db.insert(userBossQuests).values({
      userId: newUser.id,
      bossId: "snail_of_sloth",
      bossName: "Snail of Sloth",
      bossMaxHp: 30,
      bossHp: 30,
      rewardGold: 15,
      rewardXp: 20,
      status: "active",
    });

    // Create introductory history log
    await db.insert(userHistoryLogs).values({
      userId: newUser.id,
      actionType: "character_creation",
      description: `Created character ${newUser.username} the ${selectedClass}! Adventure awaits!`,
    });

    // Create session & cookies
    await createSession(newUser.id);

    // Return user info (excluding password hash/salt)
    const { passwordHash: _, salt: __, ...userProfile } = newUser;
    return NextResponse.json(userProfile);
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete signup" }, { status: 500 });
  }
}
