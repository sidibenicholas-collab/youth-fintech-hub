import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { userBossQuests, userHistoryLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const BOSSES = [
  {
    id: "snail_of_sloth",
    name: "Snail of Sloth",
    maxHp: 30,
    rewardGold: 15,
    rewardXp: 20,
    description: "A slow-moving mollusk that tempts you to delay small things. Perfect starter boss!",
  },
  {
    id: "distraction_demon",
    name: "Distraction Demon",
    maxHp: 100,
    rewardGold: 35,
    rewardXp: 45,
    description: "Feeds on open browser tabs, social media alerts, and notification pings.",
  },
  {
    id: "binge_basilisk",
    name: "Binge Basilisk",
    maxHp: 220,
    rewardGold: 65,
    rewardXp: 80,
    description: "A colossal scale-clad serpent that traps your attention for 'just one more level' or 'just one more video'.",
  },
  {
    id: "procrastination_dragon",
    name: "Procrastination Dragon",
    maxHp: 500,
    rewardGold: 160,
    rewardXp: 200,
    description: "The ultimate prehistoric fire-breather of deferred duties. It takes persistent daily progress to slay!",
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current active boss
    const activeBoss = await db
      .select()
      .from(userBossQuests)
      .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "active")))
      .limit(1);

    // Get list of completed bosses (defeated)
    const defeatedBosses = await db
      .select()
      .from(userBossQuests)
      .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "defeated")));

    return NextResponse.json({
      bossList: BOSSES,
      activeBoss: activeBoss.length > 0 ? activeBoss[0] : null,
      defeatedBossesCount: defeatedBosses.length,
    });
  } catch (error) {
    console.error("Boss GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bosses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bossId } = body;

    const chosenBoss = BOSSES.find((b) => b.id === bossId);
    if (!chosenBoss) {
      return NextResponse.json({ error: "Boss not found" }, { status: 404 });
    }

    // Deactivate/Archive previous active boss as failed/abandoned
    await db
      .update(userBossQuests)
      .set({ status: "failed" })
      .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "active")));

    // Create new active boss quest
    const [newActiveQuest] = await db
      .insert(userBossQuests)
      .values({
        userId: user.id,
        bossId: chosenBoss.id,
        bossName: chosenBoss.name,
        bossMaxHp: chosenBoss.maxHp,
        bossHp: chosenBoss.maxHp,
        rewardGold: chosenBoss.rewardGold,
        rewardXp: chosenBoss.rewardXp,
        status: "active",
      })
      .returning();

    // Log the event
    await db.insert(userHistoryLogs).values({
      userId: user.id,
      actionType: "boss_quest_started",
      description: `Began quest to defeat "${chosenBoss.name}" (${chosenBoss.maxHp} HP)!`,
    });

    return NextResponse.json({
      success: true,
      activeBoss: newActiveQuest,
      feedback: `You have challenged the "${chosenBoss.name}"! Complete your tasks to deal damage!`,
    });
  } catch (error: any) {
    console.error("Boss POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to challenge boss" }, { status: 500 });
  }
}
