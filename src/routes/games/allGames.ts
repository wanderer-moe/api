import { responseHeaders } from "@/lib/responseHeaders";
import { Game } from "@/lib/types/game";
import { listBucket } from "@/lib/listBucket";

export const allGames = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const row: D1Result<Game> = await env.database
        .prepare(`SELECT * FROM games`)
        .run();

    const gameList = await Promise.all(
        row.results.map(async (result) => ({
            name: result.name,
            id: result.id,
            assetCategories: await listBucket(env.bucket, {
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

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: gameList,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=1200");
    await cache.put(cacheKey, response.clone());

    return response;
};
