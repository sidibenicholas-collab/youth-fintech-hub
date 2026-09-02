import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { tasks, users, userBossQuests, userHistoryLogs, userItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Support editing, deleting, and completing tasks
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, difficulty, notes } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        title: title.trim(),
        difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
        notes: notes ? notes.trim() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const [deletedTask] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// Action POST route (Completing or failing tasks, clicking habit + or -)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // 'up' (positive completion) or 'down' (negative habit hit)

    if (action !== "up" && action !== "down") {
      return NextResponse.json({ error: "Invalid action. Must be 'up' or 'down'" }, { status: 400 });
    }

    // Get current task details
    const taskResult = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .limit(1);

    if (taskResult.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = taskResult[0];

    if (task.completed && task.type === "todo") {
      return NextResponse.json({ error: "To-do task is already completed" }, { status: 400 });
    }

    // Fetch user items to apply gear stat bonuses
    const items = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, user.id), eq(userItems.equipped, true)));

    // Extract item bonuses
    let damageBonus = 0;
    let defenseBonus = 0;

    items.forEach((item) => {
      if (item.type === "weapon") {
        damageBonus += item.statBoost;
      } else if (item.type === "shield" || item.type === "armor") {
        defenseBonus += item.statBoost;
      }
    });

    // Game stats copies
    let currentLevel = user.level;
    let currentXp = user.xp;
    let currentXpNeeded = user.xpNeeded;
    let currentHp = user.hp;
    const maxHp = user.maxHp;
    let currentGold = user.gold;

    let xpChange = 0;
    let goldChange = 0;
    let hpChange = 0;
    let bossDamageDealt = 0;
    let isCrit = false;

    // Difficulty base values
    let baseMultiplier = 1;
    if (task.difficulty === "easy") {
      xpChange = 5;
      goldChange = 5;
      bossDamageDealt = 4;
      hpChange = -2;
    } else if (task.difficulty === "medium") {
      xpChange = 12;
      goldChange = 12;
      bossDamageDealt = 10;
      hpChange = -5;
    } else if (task.difficulty === "hard") {
      xpChange = 25;
      goldChange = 25;
      bossDamageDealt = 25;
      hpChange = -12;
    }

    const logsToInsert = [];
    let feedbackMsg = "";

    if (action === "up") {
      // Apply character class adjustments
      // 1. Mage gets +30% Gold
      if (user.class === "Mage") {
        goldChange = Math.floor(goldChange * 1.3);
      }

      // 2. Rogue has a 15% chance to score a Critical Strike (double Gold & XP)
      if (user.class === "Rogue" && Math.random() < 0.15) {
        xpChange *= 2;
        goldChange *= 2;
        bossDamageDealt *= 2;
        isCrit = true;
      }

      // Add Weapon damage bonus to boss damage
      bossDamageDealt += damageBonus;

      // Update task progression state
      const taskUpdatePayload: any = {};
      if (task.type === "habit") {
        taskUpdatePayload.streak = task.streak + 1;
      } else if (task.type === "daily") {
        taskUpdatePayload.completedToday = true;
        taskUpdatePayload.streak = task.streak + 1;
      } else if (task.type === "todo") {
        taskUpdatePayload.completed = true;
      }
      taskUpdatePayload.updatedAt = new Date();

      await db.update(tasks).set(taskUpdatePayload).where(eq(tasks.id, task.id));

      // Award XP and Gold to user
      currentXp += xpChange;
      currentGold += goldChange;

      // Level Up Logic
      let leveledUp = false;
      while (currentXp >= currentXpNeeded) {
        leveledUp = true;
        currentLevel += 1;
        currentXp -= currentXpNeeded;
        currentXpNeeded = Math.floor(currentXpNeeded + 50);
        currentHp = maxHp; // Full health restore on level up!
        currentGold += 15; // Bonus Gold
      }

      // Attack Boss (if there is an active boss quest)
      const activeBossResult = await db
        .select()
        .from(userBossQuests)
        .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "active")))
        .limit(1);

      let bossMessage = "";
      if (activeBossResult.length > 0) {
        const activeBoss = activeBossResult[0];
        const newBossHp = Math.max(0, activeBoss.bossHp - bossDamageDealt);

        if (newBossHp === 0) {
          // Boss is Defeated!
          await db
            .update(userBossQuests)
            .set({ bossHp: 0, status: "defeated" })
            .where(eq(userBossQuests.id, activeBoss.id));

          // Award Boss Rewards
          currentGold += activeBoss.rewardGold;
          currentXp += activeBoss.rewardXp;

          // Check Level up again due to massive Boss rewards
          while (currentXp >= currentXpNeeded) {
            leveledUp = true;
            currentLevel += 1;
            currentXp -= currentXpNeeded;
            currentXpNeeded = Math.floor(currentXpNeeded + 50);
            currentHp = maxHp;
            currentGold += 15;
          }

          bossMessage = ` Victory! You defeated "${activeBoss.bossName}" and earned +${activeBoss.rewardGold} Gold and +${activeBoss.rewardXp} XP!`;

          logsToInsert.push({
            userId: user.id,
            actionType: "boss_defeat",
            description: `Defeated the boss "${activeBoss.bossName}"! Received ${activeBoss.rewardGold} Gold and ${activeBoss.rewardXp} XP bonus!`,
            goldChange: activeBoss.rewardGold,
            xpChange: activeBoss.rewardXp,
          });
        } else {
          // Just deal damage
          await db
            .update(userBossQuests)
            .set({ bossHp: newBossHp })
            .where(eq(userBossQuests.id, activeBoss.id));

          bossMessage = ` Dealt ${bossDamageDealt} damage to "${activeBoss.bossName}" (${newBossHp}/${activeBoss.bossMaxHp} HP left).`;

          logsToInsert.push({
            userId: user.id,
            actionType: "damage_dealt",
            description: `Dealt ${bossDamageDealt} damage to "${activeBoss.bossName}".`,
            xpChange: 0,
            goldChange: 0,
          });
        }
      }

      feedbackMsg = `Completed "${task.title}"! Earned +${xpChange} XP, +${goldChange} Gold.${
        isCrit ? " 🌟 CRITICAL HIT! Double rewards!" : ""
      }${bossMessage}`;

      logsToInsert.push({
        userId: user.id,
        actionType: "task_completed",
        description: `Completed "${task.title}" (${task.type}) - Earned +${xpChange} XP, +${goldChange} Gold.${
          isCrit ? " [CRITICAL STRIKE!]" : ""
        }`,
        xpChange,
        goldChange,
      });

      if (leveledUp) {
        feedbackMsg += ` 🎉 LEVEL UP! You reached Level ${currentLevel}! Fully healed! +15 Gold bonus!`;
        logsToInsert.push({
          userId: user.id,
          actionType: "level_up",
          description: `🎉 Leveled up to Level ${currentLevel}! Max HP restored and received +15 Gold bonus!`,
          goldChange: 15,
        });
      }
    } else {
      // action === 'down' (only for Habits)
      if (task.type !== "habit") {
        return NextResponse.json({ error: "Only habits can be penalized ('down' action)" }, { status: 400 });
      }

      // Apply defense reduction (Shield/Armor stats reduce damage)
      // Warrior has 20% passive damage reduction
      let finalDmg = Math.abs(hpChange);
      if (user.class === "Warrior") {
        finalDmg = Math.max(1, Math.round(finalDmg * 0.8));
      }

      finalDmg = Math.max(1, finalDmg - defenseBonus);

      // Decrement/Reset streak
      await db
        .update(tasks)
        .set({
          streak: 0,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, task.id));

      currentHp -= finalDmg;

      let fainted = false;
      if (currentHp <= 0) {
        fainted = true;
        // User faints! Level down, lose gold, fully heal to 50%
        const levelLoss = currentLevel > 1 ? 1 : 0;
        const goldLoss = Math.floor(currentGold * 0.25); // Lose 25% of gold

        currentLevel = Math.max(1, currentLevel - 1);
        currentGold -= goldLoss;
        currentHp = Math.floor(maxHp / 2);
        currentXp = 0; // Reset level progress

        // Reset current active boss HP to max (boss heals because player died)
        await db
          .update(userBossQuests)
          .set({ bossHp: userBossQuests.bossMaxHp })
          .where(and(eq(userBossQuests.userId, user.id), eq(userBossQuests.status, "active")));

        feedbackMsg = `💀 Oh no! You took ${finalDmg} damage and FAINTED! You lost 1 Level, ${goldLoss} Gold, and your active Boss healed back to full. Stay strong!`;

        logsToInsert.push({
          userId: user.id,
          actionType: "fainted",
          description: `💀 Fainted from bad habits! Lost 1 level, lost ${goldLoss} Gold, and restored HP to 50%.`,
          hpChange: currentHp - user.hp,
          goldChange: -goldLoss,
        });
      } else {
        feedbackMsg = `Ouch! Took ${finalDmg} damage from bad habit: "${task.title}".`;
        logsToInsert.push({
          userId: user.id,
          actionType: "damage_taken",
          description: `Took ${finalDmg} damage from negative habit: "${task.title}".`,
          hpChange: -finalDmg,
        });
      }
    }

    // Save updated user stats to DB
    const [updatedUser] = await db
      .update(users)
      .set({
        level: currentLevel,
        xp: currentXp,
        xpNeeded: currentXpNeeded,
        hp: currentHp,
        gold: currentGold,
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
      task: {
        ...task,
        streak: action === "up" ? task.streak + 1 : 0,
        completedToday: action === "up" && task.type === "daily",
        completed: action === "up" && task.type === "todo",
      },
    });
  } catch (error: any) {
    console.error("Task action error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute task action" }, { status: 500 });
  }
}
