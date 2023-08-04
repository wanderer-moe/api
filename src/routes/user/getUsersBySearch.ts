import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";
import { getConnection } from "@/lib/planetscale";

export const getUsersBySearch = async (c) => {
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    if (response) return response;

    const { query } = c.req.param();
    const db = await getConnection(c.env);

    const row = await db
        .execute("SELECT * FROM User WHERE username LIKE ?", [query])
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
        a.username === query ? -1 : b.username === query ? 1 : 0
    );

    response = c.json(
        {
            success: true,
            status: "ok",
            path: "/users/s/:query",
            query,
            results,
        },
        200,
        responseHeaders
    );

    response.headers.set("Cache-Control", "s-maxage=60");
    await cache.put(cacheKey, response.clone());

    return response;
};
