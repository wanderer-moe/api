import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";

export const getAssetFromId = async (
    request: Request,
    env: Env
): Promise<Response> => {
    let row: D1Result<Asset>;
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];
    console.log(id);

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    try {
        row = await env.database
            .prepare(`SELECT * FROM assets WHERE id = ?`)
            .bind(id)
            .run();
    } catch (e) {
        throw new Error(`Error getting asset from id`);
    }

    if (!row.results[0]) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "not found",
                message: "Asset not found",
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    await env.database
        .prepare(`UPDATE assets SET viewCount = viewCount + 1 WHERE id = ?`)
        .bind(id)
        .run();

    const asset: Asset = {
        id: row.results[0].id,
        name: row.results[0].name,
        game: row.results[0].game,
        asset: row.results[0].asset,
        tags: row.results[0].tags,
        url: row.results[0].url,
        verified: row.results[0].verified,
        uploadedBy: row.results[0].uploadedBy,
        uploadedDate: row.results[0].uploadedDate,
        fileSize: row.results[0].fileSize,
    };

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            asset,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=28800");
    await cache.put(cacheKey, response.clone());

    return response;
};
