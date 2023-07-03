import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";

export const getSearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const game = url.searchParams.get("game")?.split(",") || [];
    const asset = url.searchParams.get("asset")?.split(",") || [];
    const tags = url.searchParams.get("tags")?.split(",") || [];
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
        sqlQuery += ` AND name LIKE ?`;
        parameters.push(`%${query}%`);
    }

    if (game.length) {
        sqlQuery += ` AND game IN (${game.map(() => "?").join(",")})`;
        parameters.push(...game);
    }

    if (asset.length) {
        sqlQuery += ` AND asset IN (${asset.map(() => "?").join(",")})`;
        parameters.push(...asset);
    }

    sqlQuery += tags.length
        ? ` AND tags IN (${tags.map(() => "?").join(",")})`
        : "";
    tags.length && parameters.push(...tags);

    sqlQuery += ` ORDER BY uploadedDate DESC`;

    // if there are more than 1 game or asset, limited to 2500 results to prevent abuse of the API
    if (game.length > 1 || asset.length > 1) {
        sqlQuery += ` LIMIT 2500`;
    }

    const row: D1Result<Asset> = await env.database
        .prepare(sqlQuery)
        .bind(...parameters)
        .run();

    results = row.results.map((result) => ({
        id: result.id,
        name: result.name,
        game: result.game,
        asset: result.asset,
        tags: result.tags,
        url: result.url,
        verified: result.verified,
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
        fileSize: result.fileSize,
    }));

    response = new Response(
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
    let results: Asset[] = [];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const parameters = [];
    let sqlQuery = `SELECT * FROM assets WHERE 1=1`;

    sqlQuery += ` ORDER BY uploadedDate DESC LIMIT 30`;

    const row: D1Result<Asset> = await env.database
        .prepare(sqlQuery)
        .bind(...parameters)
        .run();

    results = row.results.map((result) => ({
        id: result.id,
        name: result.name,
        game: result.game,
        asset: result.asset,
        tags: result.tags,
        url: result.url,
        verified: result.verified,
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
        fileSize: result.fileSize,
    }));

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
