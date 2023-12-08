import { luciaAuth } from "../../auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { getCookie } from "hono/cookie"
export class AuthSessionManager {
    private lucia: ReturnType<typeof luciaAuth>
    private drizzle: ReturnType<typeof getConnection>["drizzle"]

    constructor(private ctx: APIContext) {
        this.lucia = luciaAuth(this.ctx.env)
        this.drizzle = getConnection(this.ctx.env).drizzle
    }

    public async validateSession() {
        const sessionCookie = getCookie(this.ctx, this.lucia.sessionCookieName)

        if (!sessionCookie) {
            return null
        }

        const { user, session } =
            await this.lucia.validateSession(sessionCookie)

        if (!session) {
            return null
        }

        return { user, session }
    }

    public async getAllSessions() {
        const sessionCookie = getCookie(this.ctx, this.lucia.sessionCookieName)

        if (!sessionCookie) {
            return null
        }

        const { user } = await this.lucia.validateSession(sessionCookie)

        if (!user) {
            return null
        }

        return await this.lucia.getUserSessions(user.id)
    }

    public async invalidateCurrentSession() {
        const sessionCookie = getCookie(this.ctx, this.lucia.sessionCookieName)

        if (!sessionCookie) {
            return null
        }

        const { session } = await this.lucia.validateSession(sessionCookie)

        if (!session) {
            return null
        }

        await this.lucia.invalidateSession(session.id)

        return true
    }

    public async invalidateAllSessions() {
        const sessionCookie = getCookie(this.ctx, this.lucia.sessionCookieName)

        if (!sessionCookie) {
            return null
        }

        const { user } = await this.lucia.validateSession(sessionCookie)

        if (!user) {
            return null
        }

        await this.lucia.invalidateUserSessions(user.id)

        return true
    }
}
