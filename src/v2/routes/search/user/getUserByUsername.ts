import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"

import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function getUserByUsername(c: APIContext): Promise<Response> {
    const { username } = c.req.param()
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
    const drizzle = getConnection(c.env).drizzle

    const user = await drizzle.query.users.findFirst({
        where: (users, { and, eq }) => and(eq(users.username, username)),
        columns: {
            email: false,
            emailVerified: false,
        },
    })

    if (!user) {
        response = createNotFoundResponse(c, "User not found", responseHeaders)
        await cache.put(cacheKey, response.clone())
        return response
    }

    response = c.json(
        {
            success: true,
            status: "ok",
            accountIsAuthed: session && session.user.userId ? true : false,
            userIsQueryingOwnAccount:
                session && session.user.userId === user.id ? true : false,
            userRoleFlagsArray: roleFlagsToArray(user.roleFlags),
            user,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=120")
    await cache.put(cacheKey, response.clone())

    return response
}
