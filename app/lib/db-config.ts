import { getServerEnv } from "../env.server"

// Get database configuration from environment variables
const env = getServerEnv()

// Construct database URL from individual parameters if DATABASE_URL is not provided
// export const getDatabaseUrl = () => {
// 	return env.DATABASE_URL || `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
// }

// Export individual config values for flexibility
export const dbConfig = {
	url: env.DATABASE_URL || `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
	host: env.DB_HOST,
	port: env.DB_PORT,
	database: env.DB_NAME,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
}
