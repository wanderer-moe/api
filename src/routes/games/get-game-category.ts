import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import type { Image } from "@/lib/types/asset";

export const getAsset = async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
): Promise<Response> => {
    const cacheUrl = new URL(request.url);

    const cacheKey = cacheUrl.toString();
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname
        .split("/")
        .filter((segment) => segment !== "");

    if (pathSegments.length !== 3 || pathSegments[0] !== "game") {
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

    const [, gameId, asset] = pathSegments;

    const files = await listBucket(env.bucket, {
        prefix: `${gameId}/${asset}/`,
    });

    if (files.objects.length === 0) {
        response = new Response(
            JSON.stringify({
                success: false,
                status: "error",
                path: `/game/${gameId}/${asset}`,
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    } else {
        const images: Image[] = files.objects.map((file) => ({
            name: file.key.split("/").pop().replace(".png", ""),
            nameWithExtension: file.key.split("/").pop(),
            path: `https://cdn.wanderer.moe/${file.key}`,
            uploaded: file.uploaded,
            size: file.size,
        }));

        const sortedImages = [...images].sort(
            (a, b) => b.uploaded.getTime() - a.uploaded.getTime()
        );

        const lastUploaded = sortedImages[0];

        response = new Response(
            JSON.stringify({
                success: true,
                status: "ok",
                path: `/game/${gameId}/${asset}`,
                game: gameId,
                asset,
                lastUploaded,
                images,
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    response.headers.append("Cache-Control", `max-age=${60 * 60 * 1}`);
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
};
