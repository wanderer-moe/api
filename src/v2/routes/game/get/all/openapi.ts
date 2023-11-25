import { createRoute } from "@hono/zod-openapi"

export const getAllGamesRoute = createRoute({
    path: "/all",
    method: "get",
    description: "Get all games.",
    tags: ["Game"],
    responses: {
        200: {
            description: "All games.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
