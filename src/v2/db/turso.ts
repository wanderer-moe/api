import { Bindings as Env } from "@/worker-configuration"
import * as schema from "@/v2/db/schema"
import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web" // because we're in a worker
import { Logger } from "drizzle-orm/logger"

class LoggerWrapper implements Logger {
	logQuery(query: string, params: unknown[]): void {
		console.log(`DRIZZLE: Query: ${query}, Paremeters: ${params ?? "none"}`)
	}
}

// wrapper for turso & drizzle
export function getConnection(env: Env) {
	const turso = createClient({
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_DATABASE_AUTH_TOKEN,
	})

	const drizzle = drizzleORM(turso, {
		schema,
		logger: new LoggerWrapper(),
	})

	return {
		drizzle,
		turso,
	}
}
