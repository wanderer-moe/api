import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import type { Subfolder, Game } from "@/lib/types/game";

export const getGames = async (
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

    const files = [
        "genshin-impact",
        "zenless-zone-zero",
        "honkai-star-rail",
        "honkai-impact-3rd",
        "needy-streamer-overload",
        "dislyte",
        "cookie-run",
        "blue-archive",
        "project-sekai",
        "tower-of-fantasy",
        "wuthering-waves",
        "reverse-1999",
        "sino-alice",
        "goddess-of-victory-nikke",
    ];

    const rootLocations = files.map(async (game) => {
        const subfolders = await listBucket(env.bucket, {
            prefix: `${game}/`,
            delimiter: "/",
        });

        return {
            name: game,
            path: `https://api.wanderer.moe/game/${game}`,
            tags: [], // backwards compatibility
            totalFiles: null,
            lastUploaded: null,
            subfolders: subfolders.delimitedPrefixes.map((subfolder) => ({
                name: subfolder.replace(`${game}/`, "").replace("/", ""),
                path: `https://api.wanderer.moe/game/${subfolder}`,
                fileCount: null,
                lastUploaded: null,
            })) as Subfolder[] | Subfolder | null,
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

    response.headers.append("Cache-Control", `max-age=${60 * 60 * 1}`);
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
};
