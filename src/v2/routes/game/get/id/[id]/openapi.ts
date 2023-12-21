import { createRoute } from "@hono/zod-openapi"
import { getGameByIdSchema, getGameByIDResponse } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const getGameByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Get a game by their ID.",
    tags: ["Game"],
    request: {
        params: getGameByIdSchema,
    },
    responses: {
        200: {
            description: "Game was found.",
            content: {
                "application/json": {
                    schema: getGameByIDResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
