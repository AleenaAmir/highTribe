import { config } from "@dotenvx/dotenvx"

// Load environment variables
config()

// Configuration interface
interface Config {
	JWT_SECRET: string
	NODE_ENV: "development" | "production" | "test"
}

// Default configuration
const defaultConfig: Config = {
	JWT_SECRET: "your-secret-key",
	NODE_ENV: "development",
}

// Environment configuration
const envConfig: Partial<Config> = {
	JWT_SECRET: "your-secret-key",
	NODE_ENV: "development", // or "production" or "test" based on your environment
}

// Merge configurations
export const appConfig: Config = {
	...defaultConfig,
	...envConfig,
}
