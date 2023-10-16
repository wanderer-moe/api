import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"

import { like, eq } from "drizzle-orm"
import { auth } from "@/v2/lib/auth/lucia"

export async function searchAll(c: APIContext): Promise<Response> {
    const { query } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
    }

    if (response) return response
    const { drizzle } = getConnection(c.env)

    // this is a disaster
    // https://cdn.discordapp.com/attachments/1102306276832202813/1147291827699986572/F.gif
    const usersResponse = await drizzle.query.users.findMany({
        where: (users) => {
            return like(users.username, `%${query}%`)
        },
        columns: {
            email: false,
            emailVerified: false,
        },
        limit: 25,
    })

    const assetCategoryResponse = await drizzle.query.assetCategories.findMany({
        where: (assetCategories) => {
            return like(assetCategories.name, `%${query}%`)
        },
        limit: 25,
    })

    const assetTagsResponse = await drizzle.query.assetTags.findMany({
        where: (assetTags) => {
            return like(assetTags.name, `%${query}%`)
        },
        limit: 25,
    })

    const assetsResponse = await drizzle.query.assets.findMany({
        where: (assets) => {
            return like(assets.name, `%${query}%`)
        },
        limit: 25,
    })

    const gamesResponse = await drizzle.query.games.findMany({
        where: (games) => {
            return like(games.name, `%${query}%`)
        },
        limit: 25,
    })

    const savedOcGeneratorsResponse =
        await drizzle.query.savedOcGenerators.findMany({
            where: (savedOcGenerators, { or, and }) => {
                return or(
                    and(
                        eq(savedOcGenerators.isPublic, 1),
                        session &&
                            eq(savedOcGenerators.userId, session.user.userId)
                    ),
                    like(savedOcGenerators.name, `%${query}%`)
                )
            },
            limit: 25,
        })

    const collectionsResponse = await drizzle.query.userCollections.findMany({
        where: (userCollections, { or, and }) => {
            return and(
                or(
                    session && eq(userCollections.userId, session.user.userId),
                    eq(userCollections.isPublic, 1)
                ),
                like(userCollections.name, `%${query}%`)
            )
        },
        limit: 25,
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            isAuthed: session && session.user.userId ? true : false,
            results: {
                usersResponse: usersResponse ? usersResponse : [],
                assetsResponse: assetsResponse ? assetsResponse : [],
                assetCategoryResponse: assetCategoryResponse
                    ? assetCategoryResponse
                    : [],
                assetTagsResponse: assetTagsResponse ? assetTagsResponse : [],
                savedOcGeneratorsResponse: savedOcGeneratorsResponse
                    ? savedOcGeneratorsResponse
                    : [],
                gamesResponse: gamesResponse ? gamesResponse : [],
                collectionsResponse: collectionsResponse
                    ? collectionsResponse
                    : [],
            },
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=1200")
    await cache.put(cacheKey, response.clone())
    return response
}
