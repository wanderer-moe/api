import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web" // because we're in a worker
import { Logger } from "drizzle-orm/logger"

import * as schema from "@/v2/db/schema"

/**
 * The `LoggerWrapper` class is used to wrap the `Logger` interface from `drizzle-orm` and provide a custom implementation of the `logQuery` method.
 * It logs the query and its parameters to the console.
 */
class LoggerWrapper implements Logger {
    // TODO(dromzeh): this is useful to log; should probably be logged elsewhere
    logQuery(query: string, params: unknown[]): void {
        console.log(`DRIZZLE: Query: ${query}, Parameters: ${params ?? "none"}`)
    }
}

/**
 * The `getConnection` function is used to create a connection to the Turso database and initialize a `drizzle-orm` instance.
 * @param env - The environment variables used to configure the connection.
 * @returns An object containing the `drizzle-orm` instance and the Turso client.
 */
export function getConnection(env: Bindings) {
    /**
     * The `createClient` function is used to create a Turso client.
     * The `url` option is set to the `TURSO_DATABASE_URL` environment variable.
     * The `authToken` option is set to the `TURSO_DATABASE_AUTH_TOKEN` environment variable.
     **/

    const turso = createClient({
        url: env.TURSO_DATABASE_URL!,
        authToken: env.TURSO_DATABASE_AUTH_TOKEN!,
    })

    /**
     * Drizzle instance is initialized with the `turso` client and database `schema`.
     * The `LoggerWrapper` is passed to the `logger` option to log queries to the console.
     */
    const drizzle = drizzleORM(turso, {
        schema: {
            ...schema,
        },
        logger: new LoggerWrapper(),
    })

    return {
        drizzle,
        turso,
    }
}

export type DrizzleInstance = ReturnType<typeof getConnection>["drizzle"]
export type TursoInstance = ReturnType<typeof getConnection>["turso"]
