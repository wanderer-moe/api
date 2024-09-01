import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import type { Location } from "@/lib/types/game";

export const getGameId = async (
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

    if (pathSegments.length !== 2 || pathSegments[0] !== "game") {
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

    const [, gameId] = pathSegments;

    const files = await listBucket(env.bucket, {
        prefix: `${gameId}/`,
        delimiter: "/",
    });

    const locations = files.delimitedPrefixes.map(async (file) => {
        const name = file.replace(`${gameId}/`, "").replace("/", "");

        return {
            name,
            path: `https://api.wanderer.moe/game/${gameId}/${file
                .replace(`${gameId}/`, "")
                .replace("/", "")}`,
            fileCount: null,
            popularity: null,
            lastUploaded: null,
        } as Location;
    });

    const locationsWithFileCount = await Promise.all(locations);

    if (files.objects.length === 0) {
        response = new Response(
            JSON.stringify({
                success: false,
                status: "error",
                path: `/game/${gameId}`,
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    } else {
        const lastUploaded = locationsWithFileCount.reduce(
            (prev, current) => {
                const prevDate = new Date(prev.lastUploaded);
                const currentDate = new Date(current.lastUploaded);
                return prevDate > currentDate ? prev : current;
            },
            { lastUploaded: 0 }
        );

        response = new Response(
            JSON.stringify({
                success: true,
                status: "ok",
                path: `/game/${gameId}`,
                game: gameId,
                lastUploaded: lastUploaded.lastUploaded,
                locations: locationsWithFileCount,
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
