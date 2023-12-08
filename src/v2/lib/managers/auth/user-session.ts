import { Context } from "hono"
import { auth } from "../../auth/lucia"

export class AuthSessionManager {
    constructor(private ctx: Context) {}
    private auth = auth(this.ctx.env as Bindings)

    async validateSession(sessionId: string) {
        return await this.auth.validateSession(sessionId)
    }
}
