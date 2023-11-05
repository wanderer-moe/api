import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import "dotenv/config"

const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL, ENVIRONMENT } =
    process.env
const TURSO_DEV_DATABASE_URL =
    process.env.TURSO_DEV_DATABASE_URL ?? "http://127.0.0.1:8080"
const isDev = ENVIRONMENT === "DEV"

async function main() {

    console.log("IS_DEV: ", isDev)

    isDev && console.log("TURSO_DEV_DATABASE_URL: ", TURSO_DEV_DATABASE_URL)
    !isDev && console.log("TURSO_DATABASE_URL: ", TURSO_DATABASE_URL)

    console.log("Awaiting 5 seconds before migrating...")
    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log("Connecting to database client...")
    const client = createClient({
        url: (isDev
            ? TURSO_DEV_DATABASE_URL ?? TURSO_DATABASE_URL
            : TURSO_DATABASE_URL) as string,
        ...(isDev ? {} : { authToken: TURSO_DATABASE_AUTH_TOKEN }),
    })
    const db = drizzleORM(client)
    console.log("Connected to database client & initialized drizzle-orm instance")

    console.log("Migrating database...")
    await migrate(db, { migrationsFolder: "./src/v2/db/migrations" })
    console.log("Migrations complete!")

    process.exit(0)
}

main().catch((err) => {
    console.error(`Error: ${err}`)
    process.exit(1)
})
