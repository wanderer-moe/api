declare global {
    /**
     * Environment variables that are required by the API.
     */
    type Bindings = {
        DISCORD_TOKEN: string
        FILES_BUCKET: R2Bucket
        KV_SESSION_STORAGE: KVNamespace
        ENVIRONMENT: string // should be "DEV", "PROD"
        VERY_SECRET_SIGNUP_KEY: string
        TURSO_DATABASE_URL: string
        TURSO_DATABASE_AUTH_TOKEN: string
        DISCORD_CLIENT_ID: string
        DISCORD_CLIENT_SECRET: string
        DISCORD_REDIRECT_URI: string
        RESEND_API_KEY: string
    }

    /**
     * Provides access to the request context within routes that are separated into individual functions.
     */
    type APIContext = import("hono").Context<{
        Bindings: Bindings
    }>
}

export default global
