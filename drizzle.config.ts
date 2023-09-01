import type { Config } from "drizzle-kit"

export default {
	out: "./src/db/migrations",
	schema: "./src/db/schema.ts",
	driver: "turso",
	breakpoints: true,
	strict: true,
	verbose: true,
} satisfies Config
