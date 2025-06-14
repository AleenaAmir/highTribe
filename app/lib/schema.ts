import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 20 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
