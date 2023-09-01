import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import type { APIContext as Context } from "@/worker-configuration"
import { like, and, eq, not, or } from "drizzle-orm"
import { auth } from "@/v2/lib/auth/lucia"
import {
    users,
    assets,
    games,
    assetCategories,
    assetTags,
    savedOcGenerators,
    collections,
} from "@/v2/db/schema"

export async function searchAll(c: Context): Promise<Response> {
    const { query } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle" || session.state === "invalid") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
    }

    if (response) return response
    const drizzle = await getConnection(c.env).drizzle

    // https://cdn.discordapp.com/attachments/1102306276832202813/1147291827699986572/F.gif
    const usersResponse = await drizzle
        .select()
        .from(users)
        .where(like(users.username, `%${query}%`))
        .execute()
    const assetsResponse = await drizzle
        .select()
        .from(assets)
        .where(like(assets.name, `%${query}%`))
        .execute()
    const assetCategoryResponse = await drizzle
        .select()
        .from(assetCategories)
        .where(like(assetCategories.name, `%${query}%`))
        .execute()
    const assetTagsResponse = await drizzle
        .select()
        .from(assetTags)
        .where(like(assetTags.name, `%${query}%`))
        .execute()
    const gamesResponse = await drizzle
        .select()
        .from(games)
        .where(like(games.name, `%${query}%`))
        .execute()
    const savedOcGeneratorsResponse = await drizzle
        .select()
        .from(savedOcGenerators)
        .where(
            and(
                or(
                    eq(savedOcGenerators.userId, session.userId),
                    not(eq(savedOcGenerators.isPublic, 0))
                ),
                like(savedOcGenerators.name, `%${query}%`)
            )
        )
        .execute()
    const collectionsResponse = await drizzle
        .select()
        .from(collections)
        .where(
            and(
                or(
                    eq(collections.userId, session.userId),
                    not(eq(collections.isPublic, 0))
                ),
                like(collections.name, `%${query}%`)
            )
        )
        .execute()

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            isAuthed: session.userId ? true : false,
            results: {
                usersResponse,
                assetsResponse,
                assetCategoryResponse,
                assetTagsResponse,
                savedOcGeneratorsResponse,
                gamesResponse,
                collectionsResponse,
            },
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=60")
    await cache.put(cacheKey, response.clone())
    return response
}
