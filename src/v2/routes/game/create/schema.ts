import { z } from "@hono/zod-openapi"

export const createGameSchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The name of the game.",
        example: "honkai-star-rail",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The formatted name of the game.",
        example: "Honkai: Star Rail",
    }),
    possibleSuggestiveContent: z.string().min(1).max(1).openapi({
        description:
            "If the game contains suggestive content. 1 = Yes, 0 = No.",
        example: "1",
    }),
})
