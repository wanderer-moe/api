import { createRoute } from "@hono/zod-openapi"

export const contributorsRoute = createRoute({
    path: "/all",
    method: "get",
    description: "Get a list of all contributors.",
    tags: ["Contributors"],
    responses: {
        200: {
            description: "All Contributors.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
