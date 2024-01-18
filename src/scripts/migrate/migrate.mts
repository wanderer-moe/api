import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import "dotenv/config"
import dotenv from "dotenv"

dotenv.config({ path: ".dev.vars" })

const {
    TURSO_DATABASE_AUTH_TOKEN,
    TURSO_DATABASE_URL,
    ENVIRONMENT,
    TURSO_DEV_DATABASE_URL = "http://127.0.0.1:8080",
} = process.env

const isDev = ENVIRONMENT === "DEV"

async function main() {
    console.log("[MIGRATION] DEV:", isDev)

    console.log(
        `[MIGRATION] URL: ${
            isDev ? TURSO_DEV_DATABASE_URL : TURSO_DATABASE_URL
        }`
    )

    // this is what industry standard fuck up prevention looks like
    const waitTime = isDev ? 1000 : 10000

    console.log(`[MIGRATION] Waiting ${waitTime}ms until migration...`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))

    console.log("[MIGRATION] Connecting to the database client...")

    const client = createClient({
        url: isDev ? TURSO_DEV_DATABASE_URL : TURSO_DATABASE_URL!,
        authToken: isDev ? undefined : TURSO_DATABASE_AUTH_TOKEN,
    })

    const db = drizzleORM(client)
    console.log(
        "[MIGRATION] Connected to the database client & initialized drizzle-orm instance"
    )

    console.log("[MIGRATION] Migrating database...")
    await migrate(db, { migrationsFolder: "./src/v2/db/migrations" })
    console.log("[MIGRATION] Migrations complete!")

    process.exit(0)
}

main().catch((err) => {
    console.error(`[MIGRATION] Error: ${err}`)
    process.exit(1)
})
