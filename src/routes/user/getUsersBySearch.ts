import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";
import { getConnection } from "@/lib/planetscale";

export const getUserBySearch = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const name = url.pathname.split("/")[3];

    if (!name) throw new Error("No username provided");

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const db = await getConnection(env);

    const row = await db
        .execute("SELECT * FROM User WHERE username LIKE ?", [name])
        .then((row) => row.rows as User[] | undefined);

    if (!row) return createNotFoundResponse("User not found", responseHeaders);

    const results = row?.map((user) => {
        return {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url || null,
            banner_url: user.banner_url || null,
            bio: user.bio || null,
            pronouns: user.pronouns || null,
            verified: user.verified,
            date_joined: user.date_joined,
            role_flags: user.role_flags,
        };
    });

    results.sort((a, b) =>
        a.username === name ? -1 : b.username === name ? 1 : 0
    );

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: results,
        }),
        {
            status: 200,
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=60");
    await cache.put(cacheKey, response.clone());

    return response;
};
