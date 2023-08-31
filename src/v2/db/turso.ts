import { Bindings as Env } from "@/worker-configuration"
import * as schema from "@/v2/db/schema"
import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web" // because we're in a worker

// wrapper for turso & drizzle
export function getConnection(env: Env) {
    const turso = createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_DATABASE_AUTH_TOKEN,
    })

    const drizzle = drizzleORM(turso, {
        schema,
        logger: true,
    })

    return {
        drizzle,
        turso,
    }
}
