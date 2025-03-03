import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import type { Image } from "@/lib/types/asset";

export const searchAssets = async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.toLowerCase();
    const limit = Number(url.searchParams.get("limit") || "100");
    const game = url.searchParams.get("game");

    if (!query || query.length < 2) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "Search query must be at least 2 characters",
            }),
            {
                headers: responseHeaders,
                status: 400,
            }
        );
    }

    if (!game) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "Game parameter is required (e.g., ?game=genshin-impact)",
            }),
            {
                headers: responseHeaders,
                status: 400,
            }
        );
    }

    const validGames = [
        "genshin-impact",
        "persona-3-reload",
        "zenless-zone-zero",
        "honkai-star-rail",
        "honkai-impact-3rd",
        "needy-streamer-overload",
        "dislyte",
        "strinova",
        "cookie-run",
        "blue-archive",
        "project-sekai",
        "tower-of-fantasy",
        "wuthering-waves",
        "reverse-1999",
        "sino-alice",
        "goddess-of-victory-nikke",
    ];

    if (!validGames.includes(game)) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: `Invalid game parameter. Must be one of: ${validGames.join(", ")}`,
            }),
            {
                headers: responseHeaders,
                status: 400,
            }
        );
    }

    const cacheKey = `search:${query}:${limit}:${game}`;
    const cache = caches.default;
    let response = await cache.match(request.url);

    if (response) {
        return response;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort('Search operation timed out');
        }, 3000);

        try {            
            const matchingFiles: Image[] = [];
            let totalScanned = 0;
            
            let cursor: string | undefined = undefined;
            let hasMore = true;
            
            while (hasMore && totalScanned < 2000 && matchingFiles.length < limit) {
                const options: R2ListOptions = {
                    prefix: `${game}/`,
                    cursor,
                    limit: 500,
                };
                
                const result = await listBucket(env.bucket, options);
                const objects = result.objects || [];
                totalScanned += objects.length;
                                
                for (const obj of objects) {
                    const key = obj.key.toLowerCase();
                    const filename = key.split('/').pop() || '';
                    
                    if (key.includes(query) || filename.includes(query)) {
                        const nameParts = filename.split('.');
                        const extension = nameParts.length > 1 ? nameParts.pop() || '' : '';
                        const name = nameParts.join('.');
                        
                        matchingFiles.push({
                            name,
                            nameWithExtension: filename,
                            path: `https://cdn.wanderer.moe/${obj.key}`,
                            uploaded: obj.uploaded,
                            size: obj.size,
                        });
                    }
                }
                
                if (result.truncated) {
                    cursor = result.cursor;
                } else {
                    hasMore = false;
                }
                
                if (matchingFiles.length >= limit) {
                    break;
                }
            }
            
            clearTimeout(timeoutId);

            matchingFiles.sort((a, b) => {
                const aExactMatch = a.name.toLowerCase() === query;
                const bExactMatch = b.name.toLowerCase() === query;
                
                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;
                
                const aNameMatch = a.name.toLowerCase().includes(query);
                const bNameMatch = b.name.toLowerCase().includes(query);
                
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                return a.name.length - b.name.length;
            });
            
            const limitedResults = matchingFiles.slice(0, limit);

            response = new Response(
                JSON.stringify({
                    success: true,
                    status: "ok",
                    query,
                    game,
                    results: limitedResults,
                    count: limitedResults.length,
                    totalScanned,
                    hasMore: matchingFiles.length > limit,
                    limit,
                }),
                {
                    headers: responseHeaders,
                    status: 200,
                }
            );
            
            ctx.waitUntil(cache.put(request.url, response.clone()));
            
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error) {
        console.error('Search error:', error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const isTimeout = errorMessage.includes('timed out') || error instanceof DOMException && error.name === 'AbortError';
        
        if (isTimeout) {
            return new Response(
                JSON.stringify({
                    success: false,
                    status: "error",
                    error: "Search timed out, try a more specific query",
                }),
                {
                    headers: responseHeaders,
                    status: 408,
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: errorMessage,
            }),
            {
                headers: responseHeaders,
                status: 500,
            }
        );
    }
};
