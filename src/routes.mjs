// src/routes.mjs

import { Router } from "itty-router";
import { responseHeaders } from "./lib/responseHeaders.mjs";
import { errorHandler } from "./middleware/errorHandler.mjs";

const router = Router();

const listBucket = async (env, options) => {
    const files = await env.bucket.list(options);
    return files;
};

const unwantedPrefixes = ["other/", "locales/", "oc-generator/"];

// TODO: stop hardcoding routes
const routes = [
    "https://api.wanderer.moe/games",
    "https://api.wanderer.moe/game/{gameId}",
    "https://api.wanderer.moe/game/{gameId}/{asset}",
    "https://api.wanderer.moe/oc-generators",
    "https://api.wanderer.moe/oc-generator/{gameId}",
];

// index route
// gets all routes and their paths
router.get(
    "/",
    errorHandler(async (request, env) => {
        return new Response(
            JSON.stringify({
                success: true,
                status: "ok",
                path: "/",
                routes,
            }),
            {
                headers: responseHeaders,
            }
        );
    })
);

// oc generator index route
// gets all oc generators
router.get(
    "/oc-generators",
    errorHandler(async (request, env) => {
        const files = await listBucket(env, {
            prefix: "oc-generator/",
            delimiter: "/",
        });

        const locations = files.delimitedPrefixes.map((file) => ({
            name: file.replace("oc-generator/", "").replace("/", ""),
            path: `https://api.wanderer.moe/oc-generator/${file
                .replace("oc-generator/", "")
                .replace("/", "")}`,
        }));

        return new Response(
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
    })
);

// oc generator :gameId route
// gets oc generator for a game
router.get(
    "/oc-generator/:gameId",
    errorHandler(async (request, env) => {
        const { gameId } = request.params;

        const files = await listBucket(env, {
            prefix: `oc-generator/${gameId}/list.json`,
        });

        if (files.objects.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    status: "error",
                    error: "404 Not Found",
                }),
                {
                    headers: responseHeaders,
                }
            );
        }

        return new Response(
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
    })
);

// games index route
// gets all games
router.get(
    "/games",
    errorHandler(async (request, env) => {
        const files = await listBucket(env, {
            prefix: "",
            delimiter: "/",
        });

        const rootLocations = files.delimitedPrefixes
            .filter((game) => !unwantedPrefixes.includes(game))
            .map(async (game) => {
                const gameFiles = await listBucket(env, {
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
                        const subfolderFiles = await listBucket(env, {
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

        return new Response(
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
    })
);

// game :gameId route
// gets asset categories for a game
router.get(
    "/game/:gameId",
    errorHandler(async (request, env) => {
        const { gameId } = request.params;

        const files = await listBucket(env, {
            prefix: `${gameId}/`,
            delimiter: "/",
        });

        const locations = files.delimitedPrefixes.map(async (file) => {
            const subfolderFiles = await listBucket(env, {
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
            return {
                name: file.replace(`${gameId}/`, "").replace("/", ""),
                path: `https://api.wanderer.moe/game/${gameId}/${file
                    .replace(`${gameId}/`, "")
                    .replace("/", "")}`,
                fileCount,
                lastUploaded: lastUploaded.uploaded,
            };
        });

        const locationsWithFileCount = await Promise.all(locations);

        const totalFiles = locationsWithFileCount.reduce(
            (total, location) => total + location.fileCount,
            0
        );

        if (files.objects.length === 0) {
            return new Response(
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
        }

        const lastUploaded = locationsWithFileCount.reduce(
            (prev, current) => {
                const prevDate = new Date(prev.lastUploaded);
                const currentDate = new Date(current.lastUploaded);
                return prevDate > currentDate ? prev : current;
            },
            { lastUploaded: 0 }
        );

        return new Response(
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
    })
);

// game :gameId :asset route
// gets all assets for a game
router.get(
    "/game/:gameId/:asset",
    errorHandler(async (request, env) => {
        const { gameId, asset } = request.params;

        const files = await listBucket(env, {
            prefix: `${gameId}/${asset}/`,
        });

        if (files.objects.length === 0) {
            return new Response(
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
        }

        const images = files.objects.map((file) => ({
            name: file.key.split("/").pop().replace(".png", ""),
            nameWithExtension: file.key.split("/").pop(),
            path: `https://cdn.wanderer.moe/${file.key}`,
            uploaded: file.uploaded,
            size: file.size,
        }));

        const lastUploaded = images.sort((a, b) => b.uploaded - a.uploaded)[0];

        return new Response(
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
    })
);

// other routes that don't exist, 404
router.all(
    "*",
    errorHandler(() => {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    })
);

// event listener for fetch events
addEventListener("fetch", (event) => {
    event.respondWith(router.handle(event.request));
});

export { router };
