import { AppHandler } from "../handler"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { assetTag, selectAssetTagSchema } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

export const modifyAssetTagPathSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            description: "The id of the tag to modify.",
            example: "official",
            in: "path",
            required: true,
        },
    }),
})

const modifyTagSchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The new name of the tag.",
        example: "official",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The new formatted name of the tag.",
        example: "Official",
    }),
})

const modifyTagResponseSchema = z.object({
    success: z.literal(true),
    tag: selectAssetTagSchema,
})

export const modifyTagRoute = createRoute({
    path: "/{id}/modify",
    method: "patch",
    summary: "Modify a tag",
    description: "Modify an existing tag.",
    tags: ["Tags"],
    request: {
        params: modifyAssetTagPathSchema,
        body: {
            content: {
                "application/json": {
                    schema: modifyTagSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the tag's attributes",
            content: {
                "application/json": {
                    schema: modifyTagResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ModifyTagRoute = (handler: AppHandler) => {
    handler.openapi(modifyTagRoute, async (ctx) => {
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

        const { name, formattedName } = ctx.req.valid("json")
        const { id } = ctx.req.valid("param")

        const { drizzle } = getConnection(ctx.env)

        const [existingTag] = await drizzle
            .select({ id: assetTag.id })
            .from(assetTag)
            .where(eq(assetTag.id, id))

        if (!existingTag.id) {
            return ctx.json(
                {
                    success: false,
                    message: "Tag with ID not found",
                },
                400
            )
        }

        const [updatedTag] = await drizzle
            .update(assetTag)
            .set({
                name,
                formattedName,
                lastUpdated: new Date().toISOString(),
            })
            .where(eq(assetTag.id, id))
            .returning()

        return ctx.json(
            {
                success: true,
                tag: updatedTag,
            },
            200
        )
    })
}
