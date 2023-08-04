import { responseHeaders } from "@/lib/responseHeaders";
import { Game } from "@/lib/types/game";
import { listBucket } from "@/lib/listBucket";

export const getAllGames = async (c) => {
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    // TODO: fix getting data from old D1 database but using Planetscale DB
    const row: D1Result<Game> = await c.env.database
        .prepare(`SELECT * FROM games`)
        .run();

    const gameList = await Promise.all(
        row.results.map(async (result) => ({
            name: result.name,
            id: result.id,
            assetCategories: await listBucket(c.env.bucket, {
                prefix: `assets/${result.name}/`,
                delimiter: "/",
            }).then((data) =>
                data.delimitedPrefixes.map((prefix) =>
                    prefix
                        .replace(`assets/${result.name}/`, "")
                        .replace("/", "")
                )
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
