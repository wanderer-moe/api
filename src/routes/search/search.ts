import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";
import * as queryLib from "@/lib/query";
import { getConnection } from "@/lib/planetscale";

export const getSearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const game = url.searchParams.get("game")?.split(",") || [];
    const asset = url.searchParams.get("asset")?.split(",") || [];
    const tags = url.searchParams.get("tags")?.split(",") || [];

    const results = await (
        await queryLib.getSearchResults(query, game, asset, tags, env)
    ).map((results) => {
        return {
            id: results.id,
            name: results.name,
            game: results.game,
            asset_category: results.asset_category,
            url: results.url,
            tags: results.tags,
            status: results.status,
            uploaded_by: results.uploaded_by,
            uploaded_date: results.uploaded_date,
            file_size: results.file_size,
        };
    });

    const response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: "/search",
            query,
            game,
            asset,
            tags,
            results,
        }),
        {
            headers: responseHeaders,
        }
    );

    return response;
};

export const getRecentAssets = async (
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

    const db = await getConnection(env);

    const row = await db
        .execute(
            "SELECT * FROM assets WHERE 1=1 ORDER BY uploaded_date DESC LIMIT 30"
        )
        .then((row) => row.rows as Asset[] | undefined);

    if (!row) {
        throw new Error("No results found");
    }

    const results = row.map((asset) => {
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
            path: "/search",
            results,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=3600");
    await cache.put(cacheKey, response.clone());
    return response;
};
