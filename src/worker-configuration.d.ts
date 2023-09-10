import type { Context } from "hono"

export type Bindings = {
	DISCORD_TOKEN: string
	bucket: R2Bucket
	ENVIRONMENT: string
	VERY_SECRET_SIGNUP_KEY: string
	TURSO_DATABASE_URL: string
	TURSO_DATABASE_AUTH_TOKEN: string
}

export type APIContext = Context<{ Bindings: Bindings }>
