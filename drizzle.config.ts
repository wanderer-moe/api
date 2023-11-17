import "dotenv/config"
import type { Config } from "drizzle-kit"
const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL, ENVIRONMENT } =
    process.env

const TURSO_DEV_DATABASE_URL =
    process.env.TURSO_DEV_DATABASE_URL ?? "http://127.0.0.1:8080"
const isDev = ENVIRONMENT === "DEV"

export default {
    out: "./src/v2/db/migrations",
    schema: "./src/v2/db/schema.ts",
    driver: "turso",
    breakpoints: true,
    strict: true,
    verbose: true,
    dbCredentials: {
        url: isDev ? TURSO_DEV_DATABASE_URL : TURSO_DATABASE_URL!,
        authToken: isDev ? undefined : TURSO_DATABASE_AUTH_TOKEN!,
    },
} satisfies Config
