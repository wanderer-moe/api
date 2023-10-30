import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import {
    assets,
    assetTagAsset,
    game as gameTable,
    assetCategory as assetCategoryTable,
    AssetStatus,
} from "@/v2/db/schema"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"

const MAX_FILE_SIZE = 5000
const ACCEPTED_IMAGE_TYPES = ["image/png"]

const UploadAssetSchema = z.object({
    asset: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    extension: z.string({
        required_error: "Extension is required",
        invalid_type_error: "Extension must be a string",
    }),
    tags: z.string().optional(),
    category: z.string({
        required_error: "Category is required",
        invalid_type_error: "Category must be a string",
    }),
    game: z.string({
        required_error: "Game is required",
        invalid_type_error: "Game must be a string",
    }),
    size: z.number({
        required_error: "Size is required",
        invalid_type_error: "Size must be a number",
    }),
    width: z.number({
        required_error: "Width is required",
        invalid_type_error: "Width must be a number",
    }),
    height: z.number({
        required_error: "Height is required",
        invalid_type_error: "Height must be a number",
    }),
})

export async function uploadAsset(c: APIContext): Promise<Response> {
    const formData = UploadAssetSchema.safeParse(await c.req.formData())

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    // return unauthorized if user is not a contributor
    if (session.user.isContributor !== 1) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const bypassApproval = session.user.isContributor === 1

    const { drizzle } = getConnection(c.env)

    const newAsset = {
        name: formData.data.name,
        extension: formData.data.extension,
        game: formData.data.game,
        assetCategory: formData.data.category,
        url: `/assets/${formData.data.game}/${formData.data.category}/${formData.data.name}.${formData.data.extension}`,
        uploadedById: session.user.userId,
        status: bypassApproval ? "approved" : ("pending" as AssetStatus),
        uploadedDate: new Date().getTime(),
        fileSize: formData.data.size, // stored in bytes
        width: formData.data.width,
        height: formData.data.height,
    }

    // rename file name to match metadata
    const newAssetFile = new File([formData.data.asset], newAsset.name, {
        type: "image/png",
    })

    const validTags = []
    const invalidTags = []

    const game = await drizzle.query.game.findFirst({
        where: (game) => {
            return eq(game.name, formData.data.game)
        },
    })

    const assetCategory = await drizzle.query.assetCategory.findFirst({
        where: (assetCategory) => {
            return eq(assetCategory.name, formData.data.category)
        },
    })

    if (!game)
        return c.json({ success: false, state: "game does not exist" }, 404)

    if (!assetCategory)
        return c.json(
            { success: false, state: "asset category does not exist" },
            404
        )

    try {
        await c.env.FILES_BUCKET.put(
            `/assets/${formData.data.game}/${formData.data.category}/${formData.data.name}.${formData.data.extension}`,
            newAssetFile
        )

        await drizzle.transaction(async (trx) => {
            // inserting new asset
            const newAssetDB = await trx
                .insert(assets)
                .values(newAsset)
                .returning({
                    assetId: assets.id,
                })

            // checking if tags exist and setting relations
            if (formData.data.tags.length > 0) {
                for (const tag of SplitQueryByCommas(formData.data.tags)) {
                    const tagExists = await trx.query.assetTag.findFirst({
                        where: (assetTag) => {
                            return eq(assetTag.name, tag)
                        },
                    })
                    if (tagExists) {
                        await trx
                            .insert(assetTagAsset)
                            .values({
                                id: crypto.randomUUID(),
                                assetId: newAssetDB[0].assetId,
                                assetTagId: tagExists[0].assetTagId,
                            })
                            .returning({
                                assetTagId: assetTagAsset.assetTagId,
                            })
                        validTags.push(tag)
                    } else {
                        invalidTags.push(tag)
                    }
                }
            }

            // updating game and category asset count
            await trx
                .update(gameTable)
                .set({
                    assetCount: game.assetCount + 1,
                })
                .where(eq(gameTable.name, formData.data.game))
                .execute()

            await trx
                .update(assetCategoryTable)
                .set({
                    assetCount: assetCategory.assetCount + 1,
                })
                .where(eq(assetCategoryTable.name, formData.data.category))
                .execute()
        })
    } catch (e) {
        await c.env.FILES_BUCKET.delete(
            `/assets/${formData.data.game}/${formData.data.category}/${formData.data.name}.${formData.data.extension}`
        )
        return c.json({ success: false, state: "failed to upload asset" }, 500)
    }

    return c.json(
        {
            success: true,
            state: "uploaded asset",
            validTags,
            invalidTags,
        },
        200
    )
}
