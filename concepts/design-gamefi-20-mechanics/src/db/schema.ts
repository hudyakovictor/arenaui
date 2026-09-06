import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// A finished (or liquidated) roguelike run from the playable prototype.
export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  cult: text("cult").notNull(),
  capital: integer("capital").notNull(),
  composure: integer("composure").notNull(),
  nodesCleared: integer("nodes_cleared").notNull(),
  outcome: text("outcome").notNull(), // "exit" | "liquidated"
  ghostDelta: jsonb("ghost_delta")
    .$type<Record<string, number>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Community votes on which mechanic should be built first.
export const mechanicVotes = pgTable("mechanic_votes", {
  id: serial("id").primaryKey(),
  mechanicId: text("mechanic_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;
