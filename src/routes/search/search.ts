import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";

export const getSearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const tags = url.searchParams.get("tags") || "";
    const after = url.searchParams.get("after") || "";
    let results: Asset[] = [];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const parameters = [];
    let sqlQuery = `SELECT * FROM assets WHERE 1=1`;

    if (query) {
        sqlQuery += ` AND name LIKE '%' || ? || '%'`;
        parameters.push(query);
    }

    if (tags) {
        sqlQuery += ` AND tags LIKE '%' || ? || '%'`;
        parameters.push(tags);
    }

    if (after) {
        sqlQuery += ` AND uid > ?`;
        parameters.push(after);
    }

    sqlQuery += ` ORDER BY uid ASC LIMIT 100`;

    const row: D1Result<Asset> = await env.database
        .prepare(sqlQuery)
        .bind(...parameters)
        .run();

    results = row.results.slice(parseInt(after, 10)).map((result) => ({
        uid: result.uid,
        name: result.name,
        url: result.url,
        tags: result.tags,
        verified: result.verified,
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
    }));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            // sqlQuery,
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
