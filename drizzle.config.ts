import "dotenv/config";

import type { Config } from "drizzle-kit";

export default {
    out: "./src/db/migrations",
    schema: "./src/db/schema.ts",
    breakpoints: true,
    driver: "mysql2",
    dbCredentials: {
        host: process.env.DATABASE_HOST! || "",
        user: process.env.DATABASE_USERNAME || "",
        password: process.env.DATABASE_PASSWORD || "",
        database: "planetscale",
    },
} satisfies Config;
