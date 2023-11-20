import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web" // because we're in a worker
import { Logger } from "drizzle-orm/logger"

// oh god

import * as schema from "@/v2/db/schema"

/**
 * The `LoggerWrapper` class is used to wrap the `Logger` interface from `drizzle-orm` and provide a custom implementation of the `logQuery` method.
 * It logs the query and its parameters to the console.
 */
class LoggerWrapper implements Logger {
    // TODO(dromzeh): this is useful to log; should probably be logged elsewhere
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
     * The `createClient` function is used to create a Turso client.
     * The `url` option is set to the `TURSO_DATABASE_URL` environment variable.
     * The `authToken` option is set to the `TURSO_DATABASE_AUTH_TOKEN` environment variable.
     **/
    const isDev = env.ENVIRONMENT !== "PROD"

    console.log(env)

    const turso = createClient({
        url: isDev ? "http://127.0.0.1:8080" : env.TURSO_DATABASE_URL!,
        authToken: isDev ? undefined : env.TURSO_DATABASE_AUTH_TOKEN!,
    })

    /**
     * Drizzle instance is initialized with the `turso` client and database `schema`.
     * The `LoggerWrapper` is passed to the `logger` option to log queries to the console.
     */
    const drizzle = drizzleORM(turso, {
        schema: {
            // this is the worst thing i've ever seen in my life
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

// export type TursoClient = ReturnType<typeof createClient>
// export type DrizzleClient = ReturnType<typeof drizzleORM>
// export type Connection = ReturnType<typeof getConnection>
