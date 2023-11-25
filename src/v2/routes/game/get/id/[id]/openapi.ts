import { createRoute } from "@hono/zod-openapi"
import { getGameByIdSchema } from "./schema"

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
        },
        500: {
            description: "Internal server error.",
        },
    },
})
