import { z } from "@hono/zod-openapi"

// this is really ugly, and we really shouldn't be doing this manually at ALL lol
// BUT the issue is that the SQLite drizzle adapter for lucia does not support LibSQL yet
// therefore, we have inconsistencies between camelCase and snake_case.

// considering that snake_case this is ONLY for this route (where we're using Lucia) - it's honestly probably fine to keep?
export const validationUserSchema = z.object({
    avatar_url: z.string().nullable(),
    banner_url: z.string().nullable(),
    username: z.string(),
    username_colour: z.string().nullable(),
    email: z.string(),
    email_verified: z.boolean(),
    pronouns: z.string().nullable(),
    verified: z.boolean(),
    bio: z.string().nullable(),
    date_joined: z.string(),
    role_flags: z.number(),
    is_contributor: z.boolean(),
    self_assignable_role_flags: z.number().nullable(),
})

export const authValidationSchema = z.object({
    success: z.literal(true),
    user: validationUserSchema,
})
