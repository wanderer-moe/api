import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const modifyGameSchema = z.object({
    id: z.string().openapi({
        description: "The id of the game to modify.",
        example: "honkai-star-rail",
    }),
    name: z.string().min(3).max(32).openapi({
        description: "The new name of the game.",
        example: "honkai-star-rail",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The new formatted name of the game.",
        example: "Honkai: Star Rail",
    }),
    possibleSuggestiveContent: z
        .string()
        .min(1)
        .max(1)
        .openapi({
            description:
                "If the game contains suggestive content. 1 = Yes, 0 = No.",
            example: "1",
        })
        .transform((value) => parseInt(value))
        .refine((value) => value === 1 || value === 0),
})

export const modifyGameResponseSchema = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})
