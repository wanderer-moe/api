import { responseHeaders } from "../lib/responseHeaders.js";
import { listBucket } from "../lib/listBucket.js";
import { checkTable } from "../lib/d1/checkTable.js";
import { checkRow } from "../lib/d1/checkRow.js";
import { getAssetRequests } from "../lib/d1/getAssetRequests.js";
// import render2 from "render2";

// TODO: Add a "popularity" value to each game_name / game_asset.
// Calculated by getting the total number of requests for each game & asset, taking in the `requests` value.
// Then, most popular games are shown first, and most popular assets are shown first. (1 = most popular, 2 = second most popular, etc.)
// If the case of a tie, assets and games can share the same popularity value.

const unwantedPrefixes = ["other/", "locales/", "oc-generator/"];

export const getGames = async (request, env) => {
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (!response) {
        const files = await listBucket(env.bucket, {
            prefix: "",
            delimiter: "/",
        });

        const rootLocations = files.delimitedPrefixes
            .filter((game) => !unwantedPrefixes.includes(game))
            .map(async (game) => {
                const gameFiles = await listBucket(env.bucket, {
                    prefix: `${game}`,
                    delimiter: "/",
                });

                const tags = gameFiles.delimitedPrefixes.some((subfolder) =>
                    subfolder.includes("sheets")
                )
                    ? ["Has Sheets"]
                    : [];

                const subfolders = await Promise.all(
                    gameFiles.delimitedPrefixes.map(async (subfolder) => {
                        const subfolderFiles = await listBucket(env.bucket, {
                            prefix: `${subfolder}`,
                        });
                        const lastUploaded = subfolderFiles.objects.reduce(
                            (prev, current) => {
                                const prevDate = new Date(prev.uploaded);
                                const currentDate = new Date(current.uploaded);
                                return prevDate > currentDate ? prev : current;
                            },
                            { uploaded: 0 }
                        );
                        return {
                            name: subfolder.replace(game, "").replace("/", ""),
                            path: `https://api.wanderer.moe/game/${subfolder}`,
                            fileCount: subfolderFiles.objects.length,
                            lastUploaded: lastUploaded.uploaded,
                        };
                    })
                );

                const totalFiles = subfolders.reduce(
                    (total, subfolder) => total + subfolder.fileCount,
                    0
                );

                const lastUploaded = subfolders.reduce(
                    (prev, current) => {
                        const prevDate = new Date(prev.lastUploaded);
                        const currentDate = new Date(current.lastUploaded);
                        return prevDate > currentDate ? prev : current;
                    },
                    { lastUploaded: 0 }
                );

                return {
                    name: game.replace("/", ""),
                    path: `https://api.wanderer.moe/game/${game}`,
                    tags,
                    totalFiles,
                    lastUploaded: lastUploaded.lastUploaded,
                    subfolders,
                };
            });

        const games = await Promise.all(rootLocations);

        response = new Response(
            JSON.stringify({
                success: true,
                status: "ok",
                path: "/games",
                games,
            }),
            {
                headers: responseHeaders,
            }
        );

        await cache.put(cacheKey, response.clone());
    }

    return response;
};

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
