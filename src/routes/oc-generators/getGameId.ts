import { responseHeaders } from "../../lib/responseHeaders";
import { listBucket } from "../../lib/listBucket";

interface Env {
    bucket: R2Bucket;
}

interface Params {
    gameId: string;
}

export const getGeneratorGameId = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const pathSegments = url.pathname
        .split("/")
        .filter((segment) => segment !== "");

    if (pathSegments.length !== 2 || pathSegments[0] !== "oc-generator") {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                path: url.pathname,
                error: "Invalid URL path",
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    const [_, gameId] = pathSegments;

    const cacheKey = new Request(url.toString(), request);
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
