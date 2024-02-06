import { createRoute } from "@hono/zod-openapi"
import {
    createRequestFormEntryResponse,
    createRequestFormEntrySchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const createRequestFormEntryRoute = createRoute({
    path: "/",
    method: "post",
    description: "Create a new entry into the request form.",
    tags: ["Requests"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createRequestFormEntrySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new request form entry.",
            content: {
                "application/json": {
                    schema: createRequestFormEntryResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
