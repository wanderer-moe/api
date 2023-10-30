import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/not-found"

import { auth } from "@/v2/lib/auth/lucia"
import {
    roleFlagsToArray,
    SelfAssignableRoleFlagsToArray,
} from "@/v2/lib/helpers/role-flags"

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
    const { drizzle } = getConnection(c.env)

    const user = await drizzle.query.authUser.findFirst({
        where: (authUser, { and, eq }) => and(eq(authUser.username, username)),
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
            userSelfAssignableRoleFlagsArray:
                SelfAssignableRoleFlagsToArray(user.roleFlags) ?? [],
            user,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=120")
    await cache.put(cacheKey, response.clone())

    return response
}
