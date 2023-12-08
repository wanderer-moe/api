import { Context } from "hono"
import { luciaAuth } from "../../auth/lucia"

export class AuthSessionManager {
    constructor(private ctx: Context) {}
    private lucia = luciaAuth(this.ctx.env as Bindings)

    async validateSession(sessionId: string) {
        return await this.lucia.validateSession(sessionId)
    }
}
