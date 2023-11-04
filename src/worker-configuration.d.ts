declare global {
    /**
     * Environment variables that are required by the API.
     */
    type Bindings = {
        DISCORD_TOKEN: string
        FILES_BUCKET: R2Bucket
        KV_SESSION_STORAGE: KVNamespace
        ENVIRONMENT: "PROD" | "DEV"
        VERY_SECRET_SIGNUP_KEY: string
        TURSO_DATABASE_URL: string
        TURSO_DATABASE_AUTH_TOKEN: string
        DISCORD_CLIENT_ID: string
        DISCORD_CLIENT_SECRET: string
        DISCORD_REDIRECT_URI: string
        RESEND_API_KEY: string
        TURSO_DEV_DATABASE_URL: string | undefined
    }

    /**
     * Provides access to the request context within routes that are separated into individual functions.
     */
    type APIContext = import("hono").Context<{
        Bindings: Bindings
    }>
}

export default global
