import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";

export const getUserBySearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const name = url.pathname.split("/")[3];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }
    const row: D1Result<User> = await env.database
        .prepare(
            `SELECT * FROM users WHERE displayName = ? OR name = ? OR name LIKE ?`
        )
        .bind(name, name, `%${name}%`)
        .run();

    if (!row.results.length) {
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

    const results = row.results.map((result) => ({
        id: result.id,
        displayName: result.displayName,
        name: result.name,
        url: `/user/${result.id}`,
        avatarUrl: result.avatarUrl,
        discordId: result.discordId,
        bio: result.bio,
        assetsUploaded: result.assetsUploaded,
        roles: result.roles,
    }));

    results.sort((a, b) => (a.name === name ? -1 : b.name === name ? 1 : 0));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: results,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=60");
    await cache.put(cacheKey, response.clone());

    return response;
};
