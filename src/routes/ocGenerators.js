import { responseHeaders } from "../lib/responseHeaders.js";
import { listBucket } from "../lib/listBucket.js";

export const getGenerators = async (request, env) => {
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const files = await listBucket(env.bucket, {
        prefix: "oc-generator/",
        delimiter: "/",
    });

    const locations = files.delimitedPrefixes.map((file) => ({
        name: file.replace("oc-generator/", "").replace("/", ""),
        path: `https://api.wanderer.moe/oc-generator/${file
            .replace("oc-generator/", "")
            .replace("/", "")}`,
    }));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: "/oc-generators",
            locations,
        }),
        {
            headers: responseHeaders,
        }
    );

    await cache.put(cacheKey, response.clone());

    return response;
};

export const getGeneratorGameId = async (request, env) => {
    const { gameId } = request.params;

    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const files = await listBucket(env.bucket, {
        prefix: `oc-generator/${gameId}/list.json`,
    });

    if (files.objects.length === 0) {
        response = new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    } else {
        response = new Response(
            JSON.stringify({
                success: true,
                status: "ok",
                path: `/oc-generator/${gameId}`,
                game: gameId,
                json: `https://cdn.wanderer.moe/oc-generator/${gameId}/list.json`,
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    await cache.put(cacheKey, response.clone());

    return response;
};
