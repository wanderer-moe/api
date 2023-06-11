import { responseHeaders } from "../../lib/responseHeaders.js";
import { listBucket } from "../../lib/listBucket.js";
import { checkTable } from "../../lib/d1/checkTable.js";
import { getAssetRequests } from "../../lib/d1/getAssetRequests.js";

export const getGameId = async (request, env) => {
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    const { gameId } = request.params;
    let response = await cache.match(cacheKey);

    if (!response) {
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

            try {
                await checkTable(env.database, gameId);
            } catch (e) {
                console.error(e);
            }

            let popularity = 0;
            try {
                const requestsCount = await getAssetRequests(
                    env.database,
                    gameId,
                    name
                );
                popularity = requestsCount;
            } catch (e) {
                console.error(e);
            }

            return {
                name,
                path: `https://api.wanderer.moe/game/${gameId}/${file
                    .replace(`${gameId}/`, "")
                    .replace("/", "")}`,
                fileCount,
                popularity,
                lastUploaded: lastUploaded.uploaded,
            };
        });

        const locationsWithFileCount = await Promise.all(locations);
        locationsWithFileCount.sort((a, b) => b.popularity - a.popularity);

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
    }

    return response;
};
