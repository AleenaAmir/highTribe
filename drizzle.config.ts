import { defineConfig } from "drizzle-kit"
import { dbConfig } from "./app/lib/db-config"

export default defineConfig({
	schema: "./app/lib/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: dbConfig.url,
	},
	verbose: true,
	strict: true,
})
