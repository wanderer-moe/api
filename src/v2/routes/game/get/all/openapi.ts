import { GenericResponses } from "@/v2/lib/response-schemas"
import { createRoute } from "@hono/zod-openapi"
import { getAllGamesResponse } from "./schema"

export const getAllGamesRoute = createRoute({
    path: "/all",
    method: "get",
    description: "Get all games.",
    tags: ["Game"],
    responses: {
        200: {
            description: "All games.",
            content: {
                "application/json": {
                    schema: getAllGamesResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
