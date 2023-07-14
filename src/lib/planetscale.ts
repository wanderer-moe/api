import { connect } from "@planetscale/database";

// useful wrapper for planetscale connection
export function getConnection(env) {
    const config = {
        // this can be set with "wrangler secret put" or through the planetscale integration on cf dashboard
        host: env.DATABASE_HOST,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        fetch: (url, init) => {
            delete init["cache"];
            return fetch(url, init);
        },
    };
    return connect(config);
}
