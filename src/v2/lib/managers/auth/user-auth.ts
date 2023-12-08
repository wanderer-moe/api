import { luciaAuth } from "../../auth/lucia"
import { Scrypt } from "oslo/password"
import { getConnection } from "@/v2/db/turso"
import { authCredentials, authUser } from "@/v2/db/schema"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { generateID } from "../../oslo"
import { eq } from "drizzle-orm"

const authUserInsertSchema = createInsertSchema(authUser).pick({
    username: true,
    email: true,
})

export class UserAuthenticationManager {
    constructor(private ctx: APIContext) {}
    private lucia = luciaAuth(this.ctx.env as Bindings)
    private drizzle = getConnection(this.ctx.env).drizzle

    public async createAccount(
        attributes: Required<z.infer<typeof authUserInsertSchema>>,
        password?: string
    ) {
        const createUserTransaction = await this.drizzle.transaction(
            async (db) => {
                try {
                    const [newUser] = await db
                        .insert(authUser)
                        .values({
                            id: generateID(),
                            username: attributes.username,
                            email: attributes.email,
                        })
                        .returning()

                    if (password) {
                        await db.insert(authCredentials).values({
                            id: generateID(20),
                            userId: newUser.id,
                            hashedPassword: await new Scrypt().hash(password),
                        })
                    }

                    return newUser
                } catch (e) {
                    await db.rollback()
                }
            }
        )

        const newSession = await this.lucia.createSession(
            createUserTransaction.id,
            {
                user_agent: this.ctx.req.header("user-agent") || "",
                ip_address: this.ctx.req.header("cf-connecting-ip") || "",
                country_code: this.ctx.req.header("cf-ipcountry") || "",
            }
        )

        const newSessionCookie = await this.lucia.createSessionCookie(
            newSession.id
        )

        return newSessionCookie
    }

    public async loginViaPassword(email: string, password: string) {
        const [foundUser] = await this.drizzle
            .select({ id: authUser.id, email: authUser.email })
            .from(authUser)
            .where(eq(authUser.email, email))

        if (!foundUser) {
            return null
        }

        const [credentials] = await this.drizzle
            .select()
            .from(authCredentials)
            .where(eq(authCredentials.userId, foundUser.id))

        if (
            !(await new Scrypt().verify(password, credentials.hashedPassword))
        ) {
            return null
        }

        const newSession = await this.lucia.createSession(foundUser.id, {
            user_agent: this.ctx.req.header("user-agent") || "",
            ip_address: this.ctx.req.header("cf-connecting-ip") || "",
            country_code: this.ctx.req.header("cf-ipcountry") || "",
        })

        const newSessionCookie = await this.lucia.createSessionCookie(
            newSession.id
        )

        return newSessionCookie
    }
}
