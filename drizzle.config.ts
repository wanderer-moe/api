import type { Config } from "drizzle-kit"

export default {
    out: "./src/v2/db/migrations",
    schema: "./src/v2/db/schema.ts",
    driver: "turso",
    breakpoints: true,
    strict: true,
    verbose: true,
    dbCredentials: {
        url: "http://127.0.0.1:8080",
    },
} satisfies Config
