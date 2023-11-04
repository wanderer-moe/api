import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import "dotenv/config"

const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL, ENVIRONMENT } =
    process.env
const TURSO_DEV_DATABASE_URL = process.env.TURSO_DEV_DATABASE_URL ?? undefined
const isDev = ENVIRONMENT === "DEV"

const client = createClient({
    url: (isDev
        ? TURSO_DEV_DATABASE_URL ?? TURSO_DATABASE_URL
        : TURSO_DATABASE_URL) as string,
    ...(isDev ? {} : { authToken: TURSO_DATABASE_AUTH_TOKEN }),
})

const db = drizzleORM(client)

migrate(db, { migrationsFolder: "./src/v2/db/migrations" })
    .then(() => {
        console.log("migrations complete")
        process.exit(0)
    })
    .catch((err) => {
        console.error(`migrations failed: ${err}`)
        process.exit(1)
    })
