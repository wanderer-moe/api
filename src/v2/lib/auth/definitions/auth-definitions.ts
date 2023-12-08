import { luciaAuth } from "../lucia"

declare module "lucia" {
    interface Register {
        Lucia: typeof luciaAuth
        DatabaseUserAttributes: {
            avatar_url: string | null
            banner_url: string | null
            username: string
            username_colour: string | null
            email: string
            email_verified: boolean
            pronouns: string | null
            verified: boolean
            bio: string | null
            date_joined: string
            role_flags: number
            is_contributor: boolean
            self_assignable_role_flags: number | null
        }
        DatabaseSessionAttributes: {
            user_agent: string
            country_code: string
            ip_address: string
        }
    }
}
