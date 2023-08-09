export interface Env {
    DISCORD_TOKEN: string;
    bucket: R2Bucket;
    DATABASE_URL: string;
    DATABASE_PASSWORD: string;
    DATABASE_USERNAME: string;
    DATABASE_HOST: string;
    ENVIRONMENT: string;
    VERY_SECRET_SIGNUP_KEY: string;
}
