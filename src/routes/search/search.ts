import { responseHeaders } from "@/lib/responseHeaders";
import { Asset } from "@/lib/types/asset";

export const getSearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    let tags = url.searchParams.get("tags") || "";
    let results: Asset[] = [];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    let sqlQuery = `SELECT * FROM assets WHERE 1=1`;

    if (query) {
        sqlQuery += ` AND name LIKE '%${query}%'`;
    }

    if (tags) {
        sqlQuery += ` AND tags LIKE '%${tags}%'`;
    }

    sqlQuery += ` ORDER BY uid DESC LIMIT 50`;

    const row: D1Result<Asset> = await env.database
        .prepare(`${sqlQuery}`)
        .run();

    results = row.results.map((result) => ({
        uid: result.uid,
        name: result.name,
        url: result.url,
        tags: result.tags,
        verified: result.verified,
        uploaded_by: result.uploaded_by,
        uploaded_date: result.uploaded_date,
    }));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            sqlQuery,
            path: "/search",
            query,
            tags,
            results,
        }),
        {
            headers: responseHeaders,
        }
    );

    return response;
};
