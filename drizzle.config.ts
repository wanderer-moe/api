import "dotenv/config"
import type { Config } from "drizzle-kit"
const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL, ENVIRONMENT } =
    process.env

const isDev = ENVIRONMENT === "DEV"

export default {
    out: "./src/v2/db/migrations",
    schema: "./src/v2/db/schema.ts",
    driver: "turso",
    breakpoints: true,
    strict: true,
    verbose: true,
    dbCredentials: {
        url: isDev ? "http://127.0.0.1:8080" : TURSO_DATABASE_URL!,
        authToken: isDev ? undefined : TURSO_DATABASE_AUTH_TOKEN!,
    },
} satisfies Config
