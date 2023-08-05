import { responseHeaders } from "@/lib/responseHeaders";
import { getConnection } from "@/lib/planetscale";
import { Context } from "hono";
import { listBucket } from "@/lib/listBucket";
import { Game } from "@/lib/types/game";

export const getAllGames = async (c: Context) => {
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const files = await listBucket(c.env.bucket, {
        prefix: "oc-generators/",
        delimiter: "/",
    });

    const results = files.delimitedPrefixes.map((file) => {
        return {
            name: file.replace("oc-generators/", "").replace("/", ""),
        };
    });

    const conn = await getConnection(c.env);
    const db = conn.planetscale;

    const gameList = await db
        .execute("SELECT * FROM games ORDER BY last_updated ASC")
        .then((row) =>
            row.rows.map((game: Game) => ({
                ...game,
                // asset categories are stored as a comma separated string in the database, so we need to split them into an array
                asset_categories: game.asset_categories.split(","),
                has_generator: results.some(
                    (generator) => generator.name === game.name
                ),
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
