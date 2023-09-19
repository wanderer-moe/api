import "dotenv/config"
const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL } = process.env
import type { Config } from "drizzle-kit"

export default {
    out: "./src/v2/db/migrations",
    schema: "./src/v2/db/schema.ts",
    driver: "turso",
    breakpoints: true,
    strict: true,
    verbose: true,
    dbCredentials: {
        url: TURSO_DATABASE_URL as string,
        authToken: TURSO_DATABASE_AUTH_TOKEN as string,
    },
} satisfies Config
