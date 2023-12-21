import { createRoute } from "@hono/zod-openapi"
import { getGameByNameSchema, getGameByNameResponse } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const getGameByNameRoute = createRoute({
    path: "/{name}",
    method: "get",
    description: "Search for games by their name.",
    tags: ["Game"],
    request: {
        params: getGameByNameSchema,
    },
    responses: {
        200: {
            description: "Game was found.",
            content: {
                "application/json": {
                    schema: getGameByNameResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
