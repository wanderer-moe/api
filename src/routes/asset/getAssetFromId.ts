import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";

export const getAssetFromId = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];

    if (!id || isNaN(parseInt(id))) {
        throw new Error("No ID provided");
    }

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const db = await getConnection(env);

    const row = await db
        .execute("SELECT * FROM assets WHERE id = ?", [id])
        .then((row) => row.rows[0] as Asset | undefined);

    if (!row) {
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

    const asset = {
        id: row.id,
        name: row.name,
        game: row.game,
        asset_category: row.asset_category,
        url: row.url,
        tags: row.tags,
        status: row.status,
        uploaded_by: row.uploaded_by,
        uploaded_date: row.uploaded_date,
        file_size: row.file_size,
    };

    const similarAssets = await (
        await db
            .execute(
                "SELECT * FROM assets WHERE game = ? AND asset_category = ? AND id != ? ORDER BY RAND() LIMIT 4",
                [row.game, row.asset_category, row.id]
            )
            .then((row) => row.rows as Asset[])
    ).map((asset) => {
        return {
            id: asset.id,
            name: asset.name,
            game: asset.game,
            asset_category: asset.asset_category,
            url: asset.url,
            tags: asset.tags,
            status: asset.status,
            uploaded_by: asset.uploaded_by,
            uploaded_date: asset.uploaded_date,
            file_size: asset.file_size,
        };
    });

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            asset,
            similarAssets,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=28800");
    await cache.put(cacheKey, response.clone());

    return response;
};
