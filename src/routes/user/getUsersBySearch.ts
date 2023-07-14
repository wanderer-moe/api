import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";
import { getConnection } from "@/lib/planetscale";

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

    const db = await getConnection(env);

    const row = await db
        .execute("SELECT * FROM auth_user WHERE username LIKE ?", [name])
        .then((row) => row.rows as User[] | undefined);

    if (!row) {
        throw new Error("No User found");
    }

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
            roles: user.role,
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
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=60");
    await cache.put(cacheKey, response.clone());

    return response;
};
