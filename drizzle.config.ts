import "dotenv/config"
import type { Config } from "drizzle-kit"
const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL, ENVIRONMENT } =
    process.env
const TURSO_DEV_DATABASE_URL = process.env.TURSO_DEV_DATABASE_URL ?? undefined

const isDev = ENVIRONMENT === "DEV"

export default {
    out: "./src/v2/db/migrations",
    schema: "./src/v2/db/schema.ts",
    driver: "turso",
    breakpoints: true,
    strict: true,
    verbose: true,
    dbCredentials: {
        url: (isDev
            ? TURSO_DEV_DATABASE_URL ?? TURSO_DATABASE_URL
            : TURSO_DATABASE_URL) as string,
        ...(isDev ? {} : { authToken: TURSO_DATABASE_AUTH_TOKEN }),
    },
} satisfies Config
