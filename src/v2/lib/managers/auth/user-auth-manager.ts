import { luciaAuth } from "../../auth/lucia"
import { Scrypt } from "lucia"
import { getConnection } from "@/v2/db/turso"
import { authCredentials, authUser } from "@/v2/db/schema"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { generateID } from "../../oslo"
import { eq, or } from "drizzle-orm"

const authUserInsertSchema = createInsertSchema(authUser).pick({
    username: true,
    email: true,
})

const USER_AGENT = "user-agent"
const CONNECTING_IP = "cf-connecting-ip"
const IP_COUNTRY = "cf-ipcountry"

export class UserAuthenticationManager {
    private lucia: ReturnType<typeof luciaAuth>
    private drizzle: ReturnType<typeof getConnection>["drizzle"]

    constructor(private ctx: APIContext) {
        this.lucia = luciaAuth(this.ctx.env)
        this.drizzle = getConnection(this.ctx.env).drizzle
    }

    private async checkForExistingUser(
        attributes: Required<z.infer<typeof authUserInsertSchema>>
    ) {
        const [existingUser] = await this.drizzle
            .select({ id: authUser.id })
            .from(authUser)
            .where(
                or(
                    eq(authUser.username, attributes.username),
                    eq(authUser.email, attributes.email)
                )
            )

        return existingUser ? true : false
    }

    private async createSessionAndCookie(userId: string) {
        const newSession = await this.lucia.createSession(userId, {
            user_agent: this.ctx.req.header(USER_AGENT) || "",
            ip_address: this.ctx.req.header(CONNECTING_IP) || "",
            country_code: this.ctx.req.header(IP_COUNTRY) || "",
        })

        return this.lucia.createSessionCookie(newSession.id)
    }

    public async createAccount(
        attributes: Required<z.infer<typeof authUserInsertSchema>>,
        password?: string
    ) {
        const existingUser = await this.checkForExistingUser(attributes)

        if (existingUser) {
            return null
        }

        let newUser: typeof authUser.$inferSelect
        try {
            const createUserTransaction = await this.drizzle.transaction(
                async (db) => {
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
                }
            )
            newUser = createUserTransaction
        } catch (e) {
            throw new Error("Failed to create user")
        }

        return this.createSessionAndCookie(newUser.id)
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

        if (!credentials) {
            return null
        }

        const validPassword = await new Scrypt().verify(
            credentials.hashedPassword,
            password
        )

        if (!validPassword) {
            return null
        }

        return this.createSessionAndCookie(foundUser.id)
    }
}
