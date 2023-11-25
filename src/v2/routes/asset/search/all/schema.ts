import { z } from "@hono/zod-openapi"

export const assetSearchAllFilterSchema = z
    .object({
        name: z.string().openapi({
            param: {
                name: "name",
                in: "query",
                required: false,
            },
            description: "The Name of the asset to retrieve.",
        }),
        category: z.string().openapi({
            param: {
                name: "category",
                in: "query",
                required: false,
            },
            description: "The Category of the asset to retrieve.",
        }),
        game: z.string().openapi({
            param: {
                name: "game",
                in: "query",
                required: false,
            },
            description: "The Game of the asset to retrieve.",
        }),
        tags: z.string().openapi({
            param: {
                name: "tags",
                in: "query",
                required: false,
            },
            description: "The Tags of the asset to retrieve.",
        }),
    })
    .partial()
