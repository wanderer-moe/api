import { luciaAuth } from "../../auth/lucia"
import { getConnection } from "@/v2/db/turso"

export class AuthSessionManager {
    constructor(private ctx: APIContext) {}
    private lucia = luciaAuth(this.ctx.env as Bindings)
    private drizzleInstance = getConnection(this.ctx.env).drizzle

    async validateSession(sessionId: string) {
        return await this.lucia.validateSession(sessionId)
    }
}
