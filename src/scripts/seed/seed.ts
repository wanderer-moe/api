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
import { generateID } from "@/v2/lib/oslo"


async function main() {

    console.log("[SEED] Connecting to database client...")
    
    // this script will only be ran in local dev so we can hardcode the url here
    const client = createClient({
        url: "http://127.0.0.1:8080",
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
                email: "testuser2@wanderer.moe",
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
                id: "test-tag-1",
                name: "test-tag-1",
                formattedName: "Test Tag 1",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "test-tag-2",
                name: "test-tag-2",
                formattedName: "Test Tag 2",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "test-tag-3",
                name: "test-tag-3",
                formattedName: "Test Tag 3",
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
                id: "test-game-1",
                name: "test-game-1",
                formattedName: "Test Game 1",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "test-game-2",
                name: "test-game-2",
                formattedName: "Test Game 2",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "test-game-3",
                name: "test-game-3",
                formattedName: "Test Game 3",
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
                id: "test-category-1",
                name: "test-category-1",
                formattedName: "Test Category 1",
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "test-category-2",
                name: "test-category-2",
                formattedName: "Test Category 2",
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
                gameId: newGames[0].id,
                assetCategoryId: newAssetCategories[0].id,
            },
            {
                gameId: newGames[1].id,
                assetCategoryId: newAssetCategories[1].id,
            },
            {
                gameId: newGames[0].id,
                assetCategoryId: newAssetCategories[1].id,
            },
        ])
        .returning()
    console.log(
        `[SEED] [gameAssetCategory] inserted ${newGameAssetCategory.length} rows\n`
    )

    console.log("[SEED] [asset] Seeding assets...")

    const assetIDArray = new Array(6).fill(null).map(() => {
        return generateID()
    })

    const newAssets = await db
        .insert(asset)
        .values([
            {
                id: assetIDArray[0],
                name: "test-asset",
                extension: "image/png",
                gameId: "test-game-1",
                assetCategoryId: "test-category-2",
                url: `/asset/${assetIDArray[0]}.png`,
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
                id: assetIDArray[1],
                name: "test-asset-2",
                extension: "image/png",
                gameId: "test-game-2",
                assetCategoryId: "test-category-2",
                url: `/asset/${assetIDArray[1]}.png`,
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
                id: assetIDArray[2],
                name: "test-asset-3",
                extension: "image/png",
                gameId: "test-game-1",
                assetCategoryId: "test-category-1",
                url: `/asset/${assetIDArray[2]}.png`,
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
                id: assetIDArray[3],
                name: "test-asset-4",
                extension: "image/png",
                gameId: "test-game-1",
                assetCategoryId: "test-category-2",
                url: `/asset/${assetIDArray[3]}.png`,
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
                id: assetIDArray[4],
                name: "test-asset-5",
                extension: "image/png",
                gameId: "test-game-1",
                assetCategoryId: "test-category-2",
                url: `/asset/${assetIDArray[4]}.png`,
                status: "approved",
                uploadedById: newUsers[2].id,
                uploadedByName: newUsers[2].username,
                viewCount: 1337,
                downloadCount: 1337,
            },
            {
                id: assetIDArray[5],
                name: "test-asset-5",
                extension: "image/png",
                gameId: "test-game-3",
                assetCategoryId: "test-category-2",
                url: `/asset/${assetIDArray[5]}.png`,
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
                assetTagId: "test-tag-1",
            },
            {
                assetId: newAssets[0].id,
                assetTagId: "test-tag-2",
            },
            {
                assetId: newAssets[1].id,
                assetTagId: "test-tag-1",
            },
            {
                assetId: newAssets[2].id,
                assetTagId: "test-tag-1",
            },
            {
                assetId: newAssets[2].id,
                assetTagId: "test-tag-2",
            },
            {
                assetId: newAssets[3].id,
                assetTagId: "test-tag-3",
            },
            {
                assetId: newAssets[4].id,
                assetTagId: "test-tag-3",
            },
            {
                assetId: newAssets[5].id,
                assetTagId: "test-tag-3",
            },
            {
                assetId: newAssets[5].id,
                assetTagId: "test-tag-2",
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
