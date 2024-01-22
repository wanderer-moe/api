import { luciaAuth } from "../../auth/lucia"
import type { Session, User } from "lucia"
import { getCookie } from "hono/cookie"

// const USER_AGENT = "user-agent"
// const CONNECTING_IP = "cf-connecting-ip"
// const IP_COUNTRY = "cf-ipcountry"

export class AuthSessionManager {
    private lucia: ReturnType<typeof luciaAuth>
    private sessionCookie: string | undefined

    constructor(private ctx: APIContext) {
        this.lucia = luciaAuth(this.ctx.env)
        this.sessionCookie = getCookie(this.ctx, this.lucia.sessionCookieName)
    }

    private async validateAndGetSession(): Promise<{
        user: User | null
        session: Session | null
    }> {
        if (!this.sessionCookie) {
            return { user: null, session: null }
        }

        const { user, session } = await this.lucia.validateSession(
            this.sessionCookie
        )

        return { user: user ? user : null, session: session ? session : null }
    }

    public async validateSession() {
        return this.validateAndGetSession()
    }

    public async getAllSessions() {
        const { user } = await this.validateAndGetSession()

        if (!user) {
            return null
        }

        return await this.lucia.getUserSessions(user.id)
    }

    public async invalidateCurrentSession() {
        const { session } = await this.validateAndGetSession()

        if (!session) {
            return null
        }

        await this.lucia.invalidateSession(session.id)

        return true
    }

    public async invalidateAllSessions() {
        const { user } = await this.validateAndGetSession()

        if (!user) {
            return null
        }

        await this.lucia.invalidateUserSessions(user.id)

        return true
    }
}
