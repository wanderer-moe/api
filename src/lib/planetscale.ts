import { connect } from "@planetscale/database";
import { Env } from "../worker-configuration";
import * as schema from "@/db/migrations/schema";
import { drizzle } from "drizzle-orm/planetscale-serverless";

// useful wrapper for planetscale connection
export function getConnection(env: Env) {
    const client = connect({
        // this can be set with "wrangler secret put" or through the planetscale integration on cf dashboard
        host: env.DATABASE_HOST,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        fetch: (url, init) => {
            delete init["cache"];
            return fetch(url, init);
        },
    });

    const db = drizzle(client, {
        schema,
        logger: true,
    });

    return {
        drizzle: db,
        planetscale: client,
    };
}
