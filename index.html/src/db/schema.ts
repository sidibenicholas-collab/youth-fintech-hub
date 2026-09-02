import { pgTable, serial, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  class: varchar("class", { length: 50 }).default("Warrior").notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  xpNeeded: integer("xp_needed").default(100).notNull(),
  hp: integer("hp").default(50).notNull(),
  maxHp: integer("max_hp").default(50).notNull(),
  gold: integer("gold").default(20).notNull(),
  avatarConfig: text("avatar_config").default('{"hair":"spiky","hairColor":"brown","skin":"fair","outfit":"apprentice"}').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'habit', 'daily', 'todo'
  title: varchar("title", { length: 255 }).notNull(),
  notes: text("notes"),
  difficulty: varchar("difficulty", { length: 50 }).default("medium").notNull(), // 'easy', 'medium', 'hard'
  streak: integer("streak").default(0).notNull(),
  completedToday: boolean("completed_today").default(false).notNull(),
  completed: boolean("completed").default(false).notNull(), // For todos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemId: varchar("item_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'potion', 'weapon', 'armor', 'shield'
  statBoost: integer("stat_boost").default(0).notNull(),
  equipped: boolean("equipped").default(false).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const userBossQuests = pgTable("user_boss_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bossId: varchar("boss_id", { length: 100 }).notNull(),
  bossName: varchar("boss_name", { length: 255 }).notNull(),
  bossMaxHp: integer("boss_max_hp").notNull(),
  bossHp: integer("boss_hp").notNull(),
  rewardGold: integer("reward_gold").notNull(),
  rewardXp: integer("reward_xp").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active', 'defeated', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userHistoryLogs = pgTable("user_history_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(), // 'task_completed', 'level_up', 'boss_defeat', 'purchase', 'damage_taken', 'damage_dealt'
  description: text("description").notNull(),
  xpChange: integer("xp_change").default(0).notNull(),
  goldChange: integer("gold_change").default(0).notNull(),
  hpChange: integer("hp_change").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
