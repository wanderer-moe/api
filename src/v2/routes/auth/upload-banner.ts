import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { CheckLabels } from "@/v2/lib/helpers/check-image-tags"
import { generateID } from "@/v2/lib/oslo"
import { getConnection } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const responseSchema = z.object({
    success: z.literal(true),
})

const requestBodySchema = z.object({
    banner: z
        .any()
        .openapi({
            description: "The image of the banner to upload.",
            example: "banner",
        })
        .refine((files) => files?.length == 1, "An image is required.")
        .refine(
            (files) => files?.[0]?.size <= 5 * 1024 * 1024,
            `Max file size is 5MB)`
        )
        .refine(
            (files) => files?.[0]?.type === "image/png",
            `Only image/png is accepted.`
        ),
})

const openRoute = createRoute({
    path: "/upload/banner",
    method: "post",
    summary: "Upload a banner",
    description: "Upload a new banner, png only, supporter only.",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: requestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "The uploaded banner",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UploadBannerRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { banner } = ctx.req.valid("form")

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user || user.plan !== "supporter") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        const labels = await CheckLabels(ctx, banner)

        if (labels) {
            return ctx.json(
                {
                    success: false,
                    message: "Image contains potentially inappropriate content",
                },
                400
            )
        }

        const { drizzle } = await getConnection(ctx.env)

        if (user.bannerUrl) {
            await ctx.env.FILES_BUCKET.delete(user.bannerUrl)
        }

        const { key } = await ctx.env.FILES_BUCKET.put(
            `/banners/${user.id}/${generateID(12)}.png`,
            banner.content
        )

        await drizzle
            .update(authUser)
            .set({
                bannerUrl: key,
            })
            .where(eq(authUser.id, user.id))

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
