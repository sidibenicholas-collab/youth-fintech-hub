import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { userHistoryLogs, tasks, users, userBossQuests, userItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db
      .select()
      .from(userHistoryLogs)
      .where(eq(userHistoryLogs.userId, user.id))
      .orderBy(desc(userHistoryLogs.createdAt))
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

// End Day / Rest at the Inn (Processes uncompleted dailies & resets completion states)
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user items to apply gear stat bonuses
    const items = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, user.id), eq(userItems.equipped, true)));

    let defenseBonus = 0;
    items.forEach((item) => {
      if (item.type === "shield" || item.type === "armor") {
        defenseBonus += item.statBoost;
      }
    });

    // 2. Fetch all user dailies
    const userDailies = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, user.id), eq(tasks.type, "daily")));

    let uncompletedCount = 0;
    let rawDamage = 0;

    userDailies.forEach((t) => {
      if (!t.completedToday) {
        uncompletedCount++;
        if (t.difficulty === "easy") rawDamage += 3;
        else if (t.difficulty === "medium") rawDamage += 6;
        else if (t.difficulty === "hard") rawDamage += 14;
      }
    });

    let finalDmg = rawDamage;

    // Apply Warrior 20% passive reduction
    if (user.class === "Warrior" && finalDmg > 0) {
      finalDmg = Math.round(finalDmg * 0.8);
    }

    // Apply shield/armor defense bonus
    finalDmg = Math.max(0, finalDmg - defenseBonus);

    // If they missed dailies, they take damage!
    let currentHp = user.hp;
    let currentLevel = user.level;
    let currentGold = user.gold;
    let currentXp = user.xp;
    const maxHp = user.maxHp;

    let feedbackMsg = "";
    const logsToInsert = [];

    let fainted = false;

    if (uncompletedCount > 0) {
      currentHp -= finalDmg;

      if (currentHp <= 0) {
        fainted = true;
        // User fainted! Level down, lose 25% gold, reset HP to half max
        const goldLoss = Math.floor(currentGold * 0.25);
        currentLevel = Math.max(1, currentLevel - 1);
        currentGold -= goldLoss;
        currentHp = Math.floor(maxHp / 2);
        currentXp = 0;

        // Reset current active boss HP to max
        await db
          .update(userBossQuests)
          .set({ bossHp: userBossQuests.bossMaxHp })
          .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "active")));

        feedbackMsg = `☀️ New Day Begins! You missed ${uncompletedCount} Daily quest(s) and took ${finalDmg} damage. This caused you to FAINT! Lost 1 Level, ${goldLoss} Gold, and your active Boss healed.`;

        logsToInsert.push({
          userId: user.id,
          actionType: "fainted",
          description: `💀 Fainted overnight! Missed ${uncompletedCount} daily tasks, took ${finalDmg} damage, lost 1 level, lost ${goldLoss} Gold.`,
          hpChange: currentHp - user.hp,
          goldChange: -goldLoss,
        });
      } else {
        feedbackMsg = `☀️ New Day Begins! You missed ${uncompletedCount} Daily quest(s) and took ${finalDmg} damage (mitigated by equipment). Current HP: ${currentHp}/${maxHp}.`;

        logsToInsert.push({
          userId: user.id,
          actionType: "damage_taken",
          description: `Took ${finalDmg} overnight damage from ${uncompletedCount} missed dailies.`,
          hpChange: -finalDmg,
        });
      }
    } else {
      // Flawless day bonus!
      const bonusGold = 5;
      const bonusXp = 10;
      currentGold += bonusGold;
      currentXp += bonusXp;

      // Check level up from perfect day bonus
      let leveledUp = false;
      let currentXpNeeded = user.xpNeeded;
      while (currentXp >= currentXpNeeded) {
        leveledUp = true;
        currentLevel += 1;
        currentXp -= currentXpNeeded;
        currentXpNeeded = Math.floor(currentXpNeeded + 50);
        currentHp = maxHp;
        currentGold += 15;
      }

      feedbackMsg = `☀️ Perfect Day! You completed all of your Daily quests! Awarded +5 Gold and +10 XP perfect day bonus!`;

      logsToInsert.push({
        userId: user.id,
        actionType: "perfect_day",
        description: "🌟 Completed all daily quests! Earned +5 Gold and +10 XP perfect day bonus!",
        goldChange: bonusGold,
        xpChange: bonusXp,
      });

      if (leveledUp) {
        feedbackMsg += ` 🎉 LEVEL UP! Reached level ${currentLevel}!`;
        logsToInsert.push({
          userId: user.id,
          actionType: "level_up",
          description: `🎉 Leveled up to Level ${currentLevel} from perfect day bonus!`,
          goldChange: 15,
        });
      }
    }

    // Reset all daily completion checkmarks for the new day
    await db
      .update(tasks)
      .set({ completedToday: false, updatedAt: new Date() })
      .where(and(eq(tasks.userId, user.id), eq(tasks.type, "daily")));

    // Save user stats
    const [updatedUser] = await db
      .update(users)
      .set({
        level: currentLevel,
        hp: currentHp,
        gold: currentGold,
        xp: currentXp,
      })
      .where(eq(users.id, user.id))
      .returning();

    // Insert history logs
    for (const log of logsToInsert) {
      await db.insert(userHistoryLogs).values(log);
    }

    const { passwordHash: _, salt: __, ...userProfile } = updatedUser;

    return NextResponse.json({
      success: true,
      feedback: feedbackMsg,
      user: userProfile,
    });
  } catch (error: any) {
    console.error("End Day error:", error);
    return NextResponse.json({ error: error.message || "Failed to process End of Day" }, { status: 500 });
  }
}
