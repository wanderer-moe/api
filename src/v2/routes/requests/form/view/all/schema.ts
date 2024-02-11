import { z } from "@hono/zod-openapi"
import { selectRequestFormSchema } from "@/v2/db/schema"

export const viewAllRequestsSchema = z
    .object({
        offset: z.string().openapi({
            param: {
                description:
                    "The offset of requests to return. This is used for pagination.",
                name: "offset",
                example: "0",
                in: "query",
                required: false,
            },
        }),
    })
    .partial()

const requestFormSchema = z.object({
    ...selectRequestFormSchema.shape,
    upvotesCount: z.number().optional(),
})

export const viewAllRequestsResponseSchema = z.object({
    success: z.literal(true),
    requests: z.array(requestFormSchema),
})
