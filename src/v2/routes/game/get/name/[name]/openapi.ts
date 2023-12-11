import { createRoute } from "@hono/zod-openapi"
import { getGameByNameSchema } from "./schema"

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
        },
        500: {
            description: "Internal server error.",
        },
    },
})
