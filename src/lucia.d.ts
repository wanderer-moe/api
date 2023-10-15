/// <reference types="lucia" />
declare namespace Lucia {
    type Auth = import("./v2/lib/auth/lucia").Auth
    type DatabaseUserAttributes = {
        avatar_url: string | null
        banner_url: string | null
        display_name: string | null
        username: string
        username_colour: string | null
        email: string
        email_verified: number
        pronouns: string | null
        verified: number
        bio: string | null
        date_joined: string
        role_flags: number
        is_contributor: number
        self_assignable_role_flags: number | null
    }
    // stored to prevent session hijacking by checking if the session attributes match the ones stored in the database
    type DatabaseSessionAttributes = {
        country_code: string
        user_agent: string
        ip_address: string
    }
}
