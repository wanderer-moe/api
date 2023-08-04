import { responseHeaders } from "@/lib/responseHeaders";
import { getConnection } from "@/lib/planetscale";
import { Context } from "hono";

export const getAllGames = async (c: Context) => {
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const db = await getConnection(c.env);

    const gameList = await db
        .execute("SELECT * FROM games ORDER BY last_updated ASC")
        .then((row) =>
            row.rows.map((game) => ({
                ...game,
                // asset categories are stored as a comma separated string in the database, so we need to split them into an array
                // @ts-expect-error - this is fine
                asset_categories: game.asset_categories.split(","),
            }))
        );

    response = c.json(
        {
            success: true,
            status: "ok",
            results: gameList,
        },
        200,
        responseHeaders
    );

    response.headers.set("Cache-Control", "s-maxage=1200");
    await cache.put(cacheKey, response.clone());

    return response;
};
