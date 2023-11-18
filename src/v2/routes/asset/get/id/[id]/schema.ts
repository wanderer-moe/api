import { z } from "@hono/zod-openapi"

export const getAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            required: true,
        },
        description: "The ID of the asset to retrieve.",
    }),
})
