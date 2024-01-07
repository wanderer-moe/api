import type { LuciaAuth } from "../lucia"

declare module "lucia" {
    interface Register {
        Lucia: LuciaAuth
        DatabaseSessionAttributes: {
            user_agent: string
            country_code: string
            ip_address: string
        }
        DatabaseUserAttributes: {
            avatar_url: string | null
            banner_url: string | null
            display_name: string | null
            username: string
            username_colour: string | null
            email: string
            email_verified: boolean
            pronouns: string | null
            verified: boolean
            bio: string | null
            date_joined: string
            is_supporter: boolean
            supporter_expires_at: string | null
            is_banned: boolean
            role_flags: number
            is_contributor: boolean
            self_assignable_role_flags: number | null
        }
    }
}
