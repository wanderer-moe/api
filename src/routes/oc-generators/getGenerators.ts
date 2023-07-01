import { responseHeaders } from "@/lib/responseHeaders";
import type { Generator } from "@/lib/types/ocGenerator";

export const getGenerators = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }
    const row: D1Result<Generator> = await env.database
        .prepare(`SELECT * FROM ocGenerators`)
        .run();

    const results = row.results.map((result) => ({
        name: result.name,
        path: `/oc-generator/${result.name}`,
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
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

    response.headers.set("Cache-Control", "s-maxage=28800");
    await cache.put(cacheKey, response.clone());

    return response;
};
