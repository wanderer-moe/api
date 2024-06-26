import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import type { Location } from "@/lib/types/game";

export const getGameId = async (
    request: Request,
    env: Env
): Promise<Response> => {
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

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const files = await listBucket(env.bucket, {
        prefix: `${gameId}/`,
        delimiter: "/",
    });

    const locations = files.delimitedPrefixes.map(async (file) => {
        const subfolderFiles = await listBucket(env.bucket, {
            prefix: `${file}`,
        });

        const fileCount = subfolderFiles.objects.length;

        const lastUploaded = subfolderFiles.objects.reduce(
            (prev, current) => {
                const prevDate = new Date(prev.uploaded);
                const currentDate = new Date(current.uploaded);
                return prevDate > currentDate ? prev : current;
            },
            { uploaded: 0 }
        );

        const name = file.replace(`${gameId}/`, "").replace("/", "");

        return {
            name,
            path: `https://api.wanderer.moe/game/${gameId}/${file
                .replace(`${gameId}/`, "")
                .replace("/", "")}`,
            fileCount,
            popularity: 0,
            lastUploaded: lastUploaded.uploaded,
        } as Location;
    });

    const locationsWithFileCount = await Promise.all(locations);

    locationsWithFileCount.sort((a, b) => b.lastUploaded - a.lastUploaded);
    locationsWithFileCount.forEach((location, index) => {
        location.popularity = index + 1;
    });

    const totalFiles = locationsWithFileCount.reduce(
        (total, location) => total + location.fileCount,
        0
    );

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
                totalFiles,
                lastUploaded: lastUploaded.lastUploaded,
                locations: locationsWithFileCount,
            }),
            {
                headers: responseHeaders,
            }
        );

        await cache.put(cacheKey, response.clone());
    }

    return response;
};
