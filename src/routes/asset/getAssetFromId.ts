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

    // doing this as we don't want to append viewCount & downloadCount
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

    // similarAssets: random 4 random assets from the same game & asset type
    const similarAssets: D1Result<Asset> = await env.database
        .prepare(
            `SELECT * FROM assets WHERE game = ? AND asset = ? ORDER BY RANDOM() LIMIT 4`
        )
        .bind(asset.game, asset.asset)
        .all();

    const similarAssetsArray: Asset[] = [];

    // as above, don't want to append viewCount & downloadCount
    similarAssets.results.forEach((asset) => {
        similarAssetsArray.push({
            id: asset.id,
            name: asset.name,
            game: asset.game,
            asset: asset.asset,
            tags: asset.tags,
            url: asset.url,
            verified: asset.verified,
            uploadedBy: asset.uploadedBy,
            uploadedDate: asset.uploadedDate,
            fileSize: asset.fileSize,
        });
    });

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            asset,
            similarAssets: similarAssetsArray,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=28800");
    await cache.put(cacheKey, response.clone());

    return response;
};
