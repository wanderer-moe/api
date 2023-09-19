import * as schema from "@/v2/db/schema"
import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web" // because we're in a worker
import { Logger } from "drizzle-orm/logger"

/**
 * The `LoggerWrapper` class is used to wrap the `Logger` interface from `drizzle-orm` and provide a custom implementation of the `logQuery` method.
 * It logs the query and its parameters to the console.
 */
class LoggerWrapper implements Logger {
    /**
     * Logs the query and its parameters to the console.
     * @param query - The SQL query string.
     * @param params - The parameters passed to the query.
     */
    logQuery(query: string, params: unknown[]): void {
        console.log(`DRIZZLE: Query: ${query}, Paremeters: ${params ?? "none"}`)
    }
}

/**
 * The `getConnection` function is used to create a connection to the Turso database and initialize a `drizzle-orm` instance.
 * @param env - The environment variables used to configure the connection.
 * @returns An object containing the `drizzle-orm` instance and the Turso client.
 */
export function getConnection(env: Bindings) {
    /**
     * The `turso` client is created using the `createClient` function from `@libsql/client/web`.
     */
    const turso = createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_DATABASE_AUTH_TOKEN,
    })

    /**
     * The `drizzle` instance is created using the `drizzleORM` function from `drizzle-orm/libsql`.
     * It is initialized with the `turso` client and the `schema` object.
     * A `LoggerWrapper` instance is also passed to the `logger` option to customize the logging behavior.
     */
    const drizzle = drizzleORM(turso, {
        schema,
        logger: new LoggerWrapper(),
    })

    return {
        drizzle,
        turso,
    }
}
