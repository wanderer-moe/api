import { responseHeaders } from "@/lib/responseHeaders";
import { getConnection } from "@/db/turso";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";

export const getUserByUsername = async (c) => {
    const { username } = c.req.param();
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const conn = await getConnection(c.env);
    const { drizzle } = conn;

    const user = await drizzle
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute();

    if (!user) {
        return createNotFoundResponse(c, "User not found", responseHeaders);
    }

    response = c.json(
        {
            success: true,
            status: "ok",
            user,
        },
        200,
        responseHeaders
    );

    response.headers.set("Cache-Control", "s-maxage=300");
    await cache.put(cacheKey, response.clone());

    return response;
};
