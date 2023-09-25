declare global {
    /**
     * The `Bindings` type is used to define the shape of the environment variables that are used by the application.
     * It includes properties for the Discord token, R2 bucket, current environment, and necessary Database credentials for Turso.
     */
    type Bindings = {
        DISCORD_TOKEN: string
        bucket: R2Bucket
        kv: KVNamespace
        ENVIRONMENT: string
        VERY_SECRET_SIGNUP_KEY: string
        TURSO_DATABASE_URL: string
        TURSO_DATABASE_AUTH_TOKEN: string
        DISCORD_CLIENT_ID: string
        DISCORD_CLIENT_SECRET: string
        DISCORD_REDIRECT_URI: string
    }

    /**
     * The `APIContext` type is used to provide access to the request context within routes that are separated into individual functions.
     * It is defined as a global type in the `globals.d.ts` file and includes properties for the request object, environment variables, and response methods.
     * @template Bindings - The shape of the environment variables that are used by the application.
     */
    type APIContext = import("hono").Context<{
        Bindings: Bindings
    }>
}

// This allows the types to be defined in the global scope throughout the API. Do not remove.
export {}
