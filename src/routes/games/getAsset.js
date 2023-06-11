import { responseHeaders } from "../../lib/responseHeaders.js";
import { listBucket } from "../../lib/listBucket.js";
import { checkTable } from "../../lib/d1/checkTable.js";
import { checkRow } from "../../lib/d1/checkRow.js";

export const getAsset = async (request, env) => {
    const { gameId, asset } = request.params;
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (!response) {
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
            const images = files.objects.map((file) => ({
                name: file.key.split("/").pop().replace(".png", ""),
                nameWithExtension: file.key.split("/").pop(),
                path: `https://cdn.wanderer.moe/${file.key}`,
                uploaded: file.uploaded,
                size: file.size,
            }));

            const lastUploaded = images.sort(
                (a, b) => b.uploaded - a.uploaded
            )[0];

            try {
                await checkTable(env.database, gameId);
                await checkRow(env.database, gameId, asset);
            } catch (e) {
                console.error(e);
            }

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

            await cache.put(cacheKey, response.clone());
        }
    }

    return response;
};
