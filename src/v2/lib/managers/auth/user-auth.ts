import { Context } from "hono"
import { luciaAuth } from "../../auth/lucia"
import { Scrypt } from "oslo/password"
import { getConnection } from "@/v2/db/turso"
import { authCredentials, authUser } from "@/v2/db/schema"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { generateID } from "../../oslo"

const authUserInsertSchema = createInsertSchema(authUser).pick({
    username: true,
    email: true,
})

export class UserAuthenticationManager {
    constructor(private ctx: Context) {}
    private lucia = luciaAuth(this.ctx.env as Bindings)
    private drizzleInstance = getConnection(this.ctx.env).drizzle

    public async createAccount(
        attributes: Required<z.infer<typeof authUserInsertSchema>>,
        password: string
    ) {
        const createUserTransaction = await this.drizzleInstance.transaction(
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

                    await db.insert(authCredentials).values({
                        id: generateID(20),
                        userId: newUser.id,
                        hashedPassword: await new Scrypt().hash(password),
                    })

                    return newUser
                } catch (e) {
                    await db.rollback()
                }
            }
        )

        await this.lucia.createSession(createUserTransaction.id, {
            user_agent: this.ctx.req.header("user-agent") || "",
            ip_address: this.ctx.req.header("cf-connecting-ip") || "",
            country_code: this.ctx.req.header("cf-ipcountry") || "",
        })

        return createUserTransaction.id
    }
}
