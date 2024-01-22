import { createRoute } from "@hono/zod-openapi"
import { allAssetLikesSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const allAssetLikesRoute = createRoute({
    path: "/",
    method: "get",
    description: "All liked assets.",
    tags: ["Asset"],
    responses: {
        200: {
            description: "Array of your liked assets.",
            content: {
                "application/json": {
                    schema: allAssetLikesSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
