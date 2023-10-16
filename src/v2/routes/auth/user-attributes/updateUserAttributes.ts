import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"

type UserAttributes = {
    display_name?: string
    username?: string
    pronouns?: string
    self_assignable_role_flags?: number
    bio?: string
}

const UpdateUserAttributesSchema = z
    .object({
        display_name: z
            .string({
                invalid_type_error: "Display name must be a string",
            })
            .optional(),
        username: z
            .string({
                invalid_type_error: "Username must be a string",
            })
            .min(3, "Username must be at least 3 characters long")
            .max(32, "Username must be at most 32 characters long")
            .optional(),
        pronouns: z
            .string({
                invalid_type_error: "Pronouns must be a string",
            })
            .optional(),
        self_assignable_roles: z
            .number({
                invalid_type_error: "Self-assignable roles must be a number",
            })
            .optional(),
        bio: z
            .string({
                invalid_type_error: "Bio must be a string",
            })
            .optional(),
    })
    .partial()

export async function updateUserAttributes(c: APIContext): Promise<Response> {
    const formData = UpdateUserAttributesSchema.safeParse(
        await c.req.formData()
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const attributes: UserAttributes = {
        display_name: formData.data.display_name,
        username: formData.data.username,
        pronouns: formData.data.pronouns,
        self_assignable_role_flags: formData.data.self_assignable_roles,
        bio: formData.data.bio,
    }

    try {
        await auth(c.env).updateUserAttributes(session.user.userId, attributes)
        return c.json(
            { success: true, state: "updated user attributes", session },
            200
        )
    } catch (error) {
        return c.json(
            { success: false, state: "error updating user attributes" },
            500
        )
    }
}
