import { responseHeaders } from "@/lib/responseHeaders";
import type { Generator } from "@/lib/types/ocGenerator";

export const getGenerator = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[2];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const row: D1Result<Generator> = await env.database
        .prepare(`SELECT * FROM ocGenerators WHERE name = ?`)
        .bind(gameId)
        .run();

    if (!row.results.length) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    const results = row.results.map((result) => ({
        name: result.name,
        data: JSON.parse(result.data),
        uploaded_by: result.uploaded_by,
        uploaded_date: result.uploaded_date,
        verified: result.verified,
    }));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: results,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=604800");
    await cache.put(cacheKey, response.clone());

    return response;
};
