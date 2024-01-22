import { createRoute } from "@hono/zod-openapi"
import { deleteAssetByIdResponseSchema, deleteAssetByIdSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const deleteAssetByIdRoute = createRoute({
    path: "/",
    method: "delete",
    description:
        "Delete an asset from their ID. Must be the owner of the asset or an admin.",
    tags: ["Asset"],
    request: {
        params: deleteAssetByIdSchema,
    },
    responses: {
        200: {
            description: "True if the asset was deleted.",
            content: {
                "application/json": {
                    schema: deleteAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
