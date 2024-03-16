import { UserRoles } from "@/v2/db/schema"
import type { LuciaAuth } from "../lucia"
import type { UserPlan } from "@/v2/db/schema"

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
            plan: UserPlan
            is_banned: boolean
            role: UserRoles
            is_contributor: boolean
        }
    }
}
