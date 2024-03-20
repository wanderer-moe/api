import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import {
    asset,
    assetCategory,
    assetTag,
    assetTagAsset,
    authCredentials,
    authUser,
    game,
    gameAssetCategory,
    userCollection,
    userCollectionAsset,
    userFollowing,
    requestFormUpvotes,
    requestForm,
    assetComments,
    assetCommentsLikes,
} from "@/v2/db/schema"
import { Scrypt } from "lucia"
import "dotenv/config"
import * as dotenv from "dotenv"

dotenv.config({ path: ".dev.vars" })

const { ENVIRONMENT, TURSO_DEV_DATABASE_URL = "http://127.0.0.1:8080" } =
    process.env

async function main() {
    if (ENVIRONMENT !== "DEV") {
        console.log("This script can only be run in development mode.")
        process.exit(1)
    }

    console.log("[SEED] Connecting to database client...")
    const client = createClient({
        url: TURSO_DEV_DATABASE_URL,
    })
    const db = drizzleORM(client)
    console.log(
        "[SEED] Connected to database client & initialized drizzle-orm instance"
    )

    console.log("[SEED] Seeding database...\n")

    console.log("[SEED] [authUser] Seeding users...")
    const newUsers = await db
        .insert(authUser)
        .values([
            {
                username: "adminuser",
                email: "admin@wanderer.moe",
                emailVerified: 1,
                usernameColour: "#84E6F8",
                bio: "test bio",
                role: "creator",
                isContributor: true,
                plan: "supporter",
            },
            {
                username: "testuser2",
                email: "testuser2@dromzeh.dev",
                emailVerified: 1,
                bio: "test bio 2",
                pronouns: "he/him/his",
                role: "uploader",
                isContributor: false,
            },
            {
                username: "testuser3",
                email: "testuser3@wanderer.moe",
                emailVerified: 1,
                bio: "test bio 3",
                role: "uploader",
                isContributor: false,
                plan: "supporter",
            },
        ])
        .returning()
    console.log(`[SEED] [authUser] inserted ${newUsers.length} rows\n`)

    const devAdminPassword = "password123"

    console.log(
        `[SEED] [userCredentials] Seeding user login for admin with password ${devAdminPassword}...`
    )

    const newCredentials = await db
        .insert(authCredentials)
        .values({
            userId: newUsers[0].id,
            hashedPassword: await new Scrypt().hash(devAdminPassword),
        })
        .returning()

    console.log(
        `[SEED] [userCredentials] inserted ${newCredentials.length} rows\n`
    )

    console.log("[SEED] [userFollowing] Seeding user following...")
    const newuserFollowing = await db
        .insert(userFollowing)
        .values([
            {
                followerId: newUsers[0].id,
                followingId: newUsers[1].id,
            },
            {
                followerId: newUsers[1].id,
                followingId: newUsers[0].id,
            },
            {
                followerId: newUsers[0].id,
                followingId: newUsers[2].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [userFollowing] inserted ${newuserFollowing.length} rows\n`
    )

    console.log("[SEED] [requestForm] Seeding request forms...")
    const newRequestForms = await db
        .insert(requestForm)
        .values([
            {
                userId: newUsers[0].id,
                title: "test request",
                area: "game",
                description: "test description",
            },
            {
                userId: newUsers[1].id,
                title: "test request 2",
                area: "game",
                description: "test description 2",
            },
        ])
        .returning()

    console.log(
        `[SEED] [requestForm] inserted ${newRequestForms.length} rows\n`
    )

    console.log("[SEED] [requestFormUpvotes] Seeding request form upvotes...")
    const newRequestFormUpvotes = await db
        .insert(requestFormUpvotes)
        .values([
            {
                requestFormId: newRequestForms[0].id,
                userId: newUsers[1].id,
            },
            {
                requestFormId: newRequestForms[1].id,
                userId: newUsers[0].id,
            },
        ])
        .returning()

    console.log(
        `[SEED] [requestFormUpvotes] inserted ${newRequestFormUpvotes.length} rows\n`
    )

    console.log("[SEED] [assetTag] Seeding asset tags...")
    const newAssetTags = await db
        .insert(assetTag)
        .values([
            {
                id: "official",
                name: "official",
                formattedName: "Official",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "1.0",
                name: "1.0",
                formattedName: "1.0",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "fanmade",
                name: "fanmade",
                formattedName: "Fanmade",
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(`[SEED] [assetTag] inserted ${newAssetTags.length} rows\n`)

    console.log("[SEED] [game] Seeding games...")
    const newGames = await db
        .insert(game)
        .values([
            {
                id: "genshin-impact",
                name: "genshin-impact",
                formattedName: "Genshin Impact",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "honkai-impact-3rd",
                name: "honkai-impact-3rd",
                formattedName: "Honkai Impact: 3rd",
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(`[SEED] [game] inserted ${newGames.length} rows\n`)

    console.log("[SEED] [assetCategory] Seeding asset categories...")
    const newAssetCategories = await db
        .insert(assetCategory)
        .values([
            {
                id: "character-sheets",
                name: "character-sheets",
                formattedName: "Character Sheets",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "splash-art",
                name: "splash-art",
                formattedName: "Splash Art",
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetCategory] inserted ${newAssetCategories.length} rows\n`
    )

    console.log(
        "[SEED] [gameAssetCategory] Linking games to asset categories..."
    )
    const newGameAssetCategory = await db
        .insert(gameAssetCategory)
        .values([
            {
                gameId: "genshin-impact",
                assetCategoryId: "character-sheets",
            },
            {
                gameId: "genshin-impact",
                assetCategoryId: "splash-art",
            },
            {
                gameId: "honkai-impact-3rd",
                assetCategoryId: "character-sheets",
            },
        ])
        .returning()
    console.log(
        `[SEED] [gameAssetCategory] inserted ${newGameAssetCategory.length} rows\n`
    )

    console.log("[SEED] [asset] Seeding assets...")
    const newAssets = await db
        .insert(asset)
        .values([
            {
                name: "test-asset",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "character-sheets",
                url: "/genshin-impact/character-sheets/test-asset.png",
                status: "approved",
                uploadedById: newUsers[0].id,
                uploadedByName: newUsers[0].username,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 512,
                height: 512,
            },
            {
                name: "test-asset-2",
                extension: "image/png",
                gameId: "honkai-impact-3rd",
                assetCategoryId: "character-sheets",
                url: "/honkai-impact-3rd/character-sheets/test-asset2.png",
                status: "approved",
                uploadedById: newUsers[1].id,
                uploadedByName: newUsers[1].username,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1920,
                height: 1080,
            },
            {
                name: "test-asset-3",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "splash-art",
                url: "/genshin-impact/splash-art/test-asset3.png",
                status: "approved",
                uploadedById: newUsers[1].id,
                uploadedByName: newUsers[1].username,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1080,
                height: 1920,
            },
            {
                name: "test-asset-4",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "splash-art",
                url: "/genshin-impact/splash-art/test-asset4.png",
                status: "approved",
                uploadedById: newUsers[1].id,
                uploadedByName: newUsers[1].username,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1920,
                height: 1080,
            },
            {
                name: "test-asset-5",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "splash-art",
                url: "/genshin-impact/splash-art/test-asset5.png",
                status: "approved",
                uploadedById: newUsers[2].id,
                uploadedByName: newUsers[2].username,
                viewCount: 1337,
                downloadCount: 1337,
            },
            {
                name: "test-asset-6",
                extension: "image/png",
                gameId: "honkai-impact-3rd",
                assetCategoryId: "character-sheets",
                url: "/honkai-impact-3rd/character-sheets/test-asset6.png",
                status: "approved",
                uploadedById: newUsers[2].id,
                uploadedByName: newUsers[2].username,
                viewCount: 1337,
                downloadCount: 1337,
            },
        ])
        .returning()
    console.log(`[SEED] [asset] inserted ${newAssets.length} rows\n`)

    console.log("[SEED] [assetTagAsset] Linking assets to asset tags...")
    const newAssetTagAsset = await db
        .insert(assetTagAsset)
        .values([
            {
                assetId: newAssets[0].id,
                assetTagId: "official",
            },
            {
                assetId: newAssets[0].id,
                assetTagId: "1.0",
            },
            {
                assetId: newAssets[1].id,
                assetTagId: "official",
            },
            {
                assetId: newAssets[2].id,
                assetTagId: "official",
            },
            {
                assetId: newAssets[2].id,
                assetTagId: "1.0",
            },
            {
                assetId: newAssets[3].id,
                assetTagId: "fanmade",
            },
            {
                assetId: newAssets[4].id,
                assetTagId: "fanmade",
            },
            {
                assetId: newAssets[5].id,
                assetTagId: "fanmade",
            },
            {
                assetId: newAssets[5].id,
                assetTagId: "1.0",
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetTagAsset] inserted ${newAssetTagAsset.length} rows\n`
    )

    console.log("[SEED] [assetComments] Seeding asset comments...")
    const newAssetComments = await db
        .insert(assetComments)
        .values([
            {
                assetId: newAssets[0].id,
                commentedById: newUsers[0].id,
                comment: "test comment",
            },
            {
                assetId: newAssets[0].id,
                commentedById: newUsers[1].id,
                comment: "test comment 2",
            },
            {
                assetId: newAssets[1].id,
                commentedById: newUsers[0].id,
                comment: "test comment 3",
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetComments] inserted ${newAssetComments.length} rows\n`
    )

    console.log(
        "[SEED] [assetComments] Seeding replies to comments [self ref]..."
    )
    const newAssetCommentsReplies = await db
        .insert(assetComments)
        .values([
            {
                commentedById: newUsers[1].id,
                comment: "test comment reply",
                parentCommentId: newAssetComments[0].id,
            },
            {
                commentedById: newUsers[0].id,
                comment: "test comment reply 2",
                parentCommentId: newAssetComments[1].id,
            },
            {
                commentedById: newUsers[1].id,
                comment: "test comment reply 3",
                parentCommentId: newAssetComments[2].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetComments] inserted ${newAssetCommentsReplies.length} rows\n`
    )

    const newAssetCommentsRepliesReplies = await db
        .insert(assetComments)
        .values([
            {
                commentedById: newUsers[0].id,
                comment: "test comment reply reply",
                parentCommentId: newAssetCommentsReplies[0].id,
            },
            {
                commentedById: newUsers[1].id,
                comment: "test comment reply reply 2",
                parentCommentId: newAssetCommentsReplies[1].id,
            },
            {
                commentedById: newUsers[0].id,
                comment: "test comment reply reply 3",
                parentCommentId: newAssetCommentsReplies[2].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetComments] inserted ${newAssetCommentsRepliesReplies.length} rows\n`
    )

    console.log("[SEED] [assetCommentsLikes] Seeding asset comments likes...")
    const newAssetCommentsLikes = await db
        .insert(assetCommentsLikes)
        .values([
            {
                commentId: newAssetComments[0].id,
                likedById: newUsers[1].id,
            },
            {
                commentId: newAssetComments[1].id,
                likedById: newUsers[0].id,
            },
            {
                commentId: newAssetComments[2].id,
                likedById: newUsers[1].id,
            },
            {
                commentId: newAssetCommentsReplies[0].id,
                likedById: newUsers[0].id,
            },
            {
                commentId: newAssetCommentsReplies[1].id,
                likedById: newUsers[1].id,
            },
            {
                commentId: newAssetCommentsReplies[2].id,
                likedById: newUsers[0].id,
            },
            {
                commentId: newAssetCommentsRepliesReplies[0].id,
                likedById: newUsers[1].id,
            },
            {
                commentId: newAssetCommentsRepliesReplies[1].id,
                likedById: newUsers[0].id,
            },
            {
                commentId: newAssetCommentsRepliesReplies[2].id,
                likedById: newUsers[1].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [assetCommentsLikes] inserted ${newAssetCommentsLikes.length} rows\n`
    )

    console.log("[SEED] [userCollection] Seeding user collections...")
    const newUserCollections = await db
        .insert(userCollection)
        .values({
            name: "collection name",
            description: "collection description",
            userId: newUsers[0].id,
            isPublic: true, // default to private
        })
        .returning()
    console.log(
        `[SEED] [userCollection] inserted ${newUserCollections.length} rows\n`
    )

    console.log(
        "[SEED] [userCollectionAsset] Linking user collections to assets..."
    )
    const newUserCollectionAssets = await db
        .insert(userCollectionAsset)
        .values([
            {
                collectionId: newUserCollections[0].id,
                order: 0,
                assetId: newAssets[0].id,
            },
            {
                collectionId: newUserCollections[0].id,
                order: 1,
                assetId: newAssets[1].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [userCollectionAsset] inserted ${newUserCollectionAssets.length} rows\n`
    )

    console.log("[SEED] Seeded database successfully")
    process.exit(0)
}

main().catch((err) => {
    console.error(`[SEED] Error: ${err}`)
    process.exit(1)
})
