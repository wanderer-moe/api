import { z } from "@hono/zod-openapi"
import { selectRequestFormSchema } from "@/v2/db/schema"
import type { requestArea } from "@/v2/db/schema"

export const createRequestFormEntrySchema = z.object({
    title: z.string().min(3).max(32).openapi({
        description: "The title of the request.",
        example: "Add HSR UI assets",
    }),
    area: z
        .string()
        .min(3)
        .max(32)
        .openapi({
            description: "The area of the request.",
            example: "asset",
        })
        .transform((value) => value as requestArea),
    description: z.string().min(3).max(256).openapi({
        description: "The description of the request.",
        example:
            "Add the UI assets for Honkai: Star Rail, including the logo and other UI elements.",
    }),
})

export const createRequestFormEntryResponse = z.object({
    success: z.literal(true),
    response: selectRequestFormSchema,
})
