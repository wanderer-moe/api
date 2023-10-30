import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import "dotenv/config"

const { TURSO_DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL } = process.env

const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_DATABASE_AUTH_TOKEN,
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
