import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json(userTasks);
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, difficulty, notes } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    if (!["habit", "daily", "todo"].includes(type)) {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    const taskDifficulty = ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium";

    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        type,
        title: title.trim(),
        difficulty: taskDifficulty,
        notes: notes ? notes.trim() : null,
        streak: 0,
        completedToday: false,
        completed: false,
      })
      .returning();

    return NextResponse.json(newTask);
  } catch (error: any) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
