import { OpenAPIHono } from "@hono/zod-openapi"
import { getAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { asset } from "@/v2/db/schema"
import { eq, sql } from "drizzle-orm"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const foundAsset = await drizzle.query.asset.findFirst({
        where: (asset, { eq }) => eq(asset.id, parseInt(assetId)),
        with: {
            assetTagAsset: {
                with: {
                    assetTag: true,
                },
            },
            authUser: {
                columns: {
                    id: true,
                    avatarUrl: true,
                    displayName: true,
                    username: true,
                    usernameColour: true,
                    pronouns: true,
                    verified: true,
                    bio: true,
                    dateJoined: true,
                    plan: true,
                    role: true,
                },
            },
            game: true,
            assetCategory: true,
        },
    })

    if (!foundAsset) {
        return ctx.json(
            {
                success: false,
                message: "Asset not found",
            },
            400
        )
    }

    await drizzle
        .update(asset)
        .set({
            viewCount: sql`${asset.viewCount} + 1`,
        })
        .where(eq(asset.id, parseInt(assetId)))

    return ctx.json(
        {
            success: true,
            asset: foundAsset,
        },
        200
    )
})

export default handler
