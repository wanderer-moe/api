import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"
import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"

const DeleteOCGeneratorResponseSchema = z.object({
    deleteID: z.string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
    }),
})

export async function deleteOCGeneratorResponse(
    c: APIContext
): Promise<Response> {
    const formData = DeleteOCGeneratorResponseSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { deleteID } = formData.data

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    try {
        await drizzle
            .delete(savedOcGenerators)
            .where(
                and(
                    eq(savedOcGenerators.id, deleteID),
                    eq(savedOcGenerators.userId, session.user.userId)
                )
            )
    } catch (e) {
        return c.json(
            { success: false, state: "failed to delete saved oc generator" },
            500
        )
    }

    return c.json(
        {
            success: true,
            state: `deleted saved oc generator with id ${deleteID}`,
        },
        200
    )
}
