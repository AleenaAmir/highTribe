import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { dbConfig } from "./db-config"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle>

function initDb() {
	const client = postgres(dbConfig.url)
	return drizzle(client, { schema })
}

export function getDb() {
	if (!db) {
		db = initDb()
	}
	return db
}
