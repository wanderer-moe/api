import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { assetTag } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the tag to delete.",
            example: "official",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/delete",
    method: "delete",
    summary: "Delete a tag",
    description: "Delete a tag.",
    tags: ["Tags"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "Returns boolean indicating success.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const DeleteTagRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const id = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundTag] = await drizzle
            .select({ id: assetTag.id })
            .from(assetTag)
            .where(eq(assetTag.id, id))

        if (!foundTag) {
            return ctx.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                400
            )
        }

        const authSessionManager = new AuthSessionManager(ctx)
        const { user } = await authSessionManager.validateSession()

        if (!user || user.role != "creator") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        await drizzle.delete(assetTag).where(eq(assetTag.id, id))

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
