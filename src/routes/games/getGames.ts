import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import { unwantedPrefixes } from "@/middleware/unwantedPrefixes";
import type { Subfolder, Game } from "@/lib/types/game";

export const getGames = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

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
                    } as Subfolder;
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
            } as Game;
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

    return response;
};
