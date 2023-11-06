import { drizzle as drizzleORM } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import "dotenv/config"
import {
    asset,
    game,
    gameAssetCategory,
    assetCategory,
    assetTag,
    assetTagAsset,
    authUser,
    userNetworking,
    userCollection,
    userCollectionAsset,
    userFavoriteAsset,
    userFavorite,
} from "@/v2/db/schema"
import { generateID } from "@/v2/lib/oslo"

const { ENVIRONMENT } = process.env

const TURSO_DEV_DATABASE_URL =
    process.env.TURSO_DEV_DATABASE_URL ?? "http://127.0.0.1:8080"
const isDev = ENVIRONMENT === "DEV"

async function main() {
    if (!isDev) {
        console.log("This script can only be run in development mode.")
        process.exit(1)
    }

    console.log("Connecting to database client...")
    const client = createClient({
        url: TURSO_DEV_DATABASE_URL,
    })
    const db = drizzleORM(client)
    console.log(
        "Connected to database client & initialized drizzle-orm instance"
    )

    console.log("Seeding database...\n")

    console.log("[authUser] Seeding users...")
    const newUsers = await db
        .insert(authUser)
        .values([
            {
                id: generateID(),
                username: "testuser",
                email: "hi@dromzeh.dev",
                emailVerified: 1,
                usernameColour: "#84E6F8",
                bio: "test bio",
                roleFlags: 1,
                isContributor: 0,
                selfAssignableRoleFlags: 0,
            },
            {
                id: generateID(),
                username: "testuser2",
                email: "hi2@dromzeh.dev",
                emailVerified: 1,
                bio: "test bio 2",
                pronouns: "he/him/his",
                roleFlags: 1,
                isContributor: 0,
                selfAssignableRoleFlags: 0,
            },
            {
                id: generateID(),
                username: "testuser3",
                email: "hi3@dromzeh.dev",
                emailVerified: 1,
                bio: "test bio 3",
                roleFlags: 1,
                isContributor: 0,
                selfAssignableRoleFlags: 0,
            },
        ])
        .returning()
    console.log(`[authUser] inserted ${newUsers.length} rows\n`)

    console.log("[userNetworking] Seeding user following...")
    const newUserNetworking = await db
        .insert(userNetworking)
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
    console.log(`[userNetworking] inserted ${newUserNetworking.length} rows\n`)

    console.log("[assetTag] Seeding asset tags...")
    const newAssetTags = await db
        .insert(assetTag)
        .values([
            {
                id: "official",
                name: "official",
                formattedName: "Official",
                assetCount: 1,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "1.0",
                name: "1.0",
                formattedName: "1.0",
                assetCount: 1,
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(`[assetTag] inserted ${newAssetTags.length} rows\n`)

    console.log("[game] Seeding games...")
    const newGames = await db
        .insert(game)
        .values([
            {
                id: "genshin-impact",
                name: "genshin-impact",
                formattedName: "Genshin Impact",
                assetCount: 1,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "honkai-impact-3rd",
                name: "honkai-impact-3rd",
                formattedName: "Honkai Impact: 3rd",
                assetCount: 0,
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(`[game] inserted ${newGames.length} rows\n`)

    console.log("[assetCategory] Seeding asset categories...")
    const newAssetCategories = await db
        .insert(assetCategory)
        .values([
            {
                id: "character-sheets",
                name: "character-sheets",
                formattedName: "Character Sheets",
                assetCount: 1,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: "splash-art",
                name: "splash-art",
                formattedName: "Splash Art",
                assetCount: 0,
                lastUpdated: new Date().toISOString(),
            },
        ])
        .returning()
    console.log(`[assetCategory] inserted ${newAssetCategories.length} rows\n`)

    console.log("[gameAssetCategory] Linking games to asset categories...")
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
        `[gameAssetCategory] inserted ${newGameAssetCategory.length} rows\n`
    )

    console.log("[asset] Seeding assets...")
    const newAssets = await db
        .insert(asset)
        .values([
            {
                id: 1,
                name: "test-asset",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "character-sheets",
                url: "/test/image.png",
                status: "approved",
                uploadedById: newUsers[0].id,
                assetIsOptimized: 0,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1920,
                height: 1080,
            },
            {
                id: 2,
                name: "test-asset-2",
                extension: "image/png",
                gameId: "honkai-impact-3rd",
                assetCategoryId: "character-sheets",
                url: "/test/image.png",
                status: "approved",
                uploadedById: newUsers[1].id,
                assetIsOptimized: 0,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1920,
                height: 1080,
            },
            {
                id: 3,
                name: "test-asset-3",
                extension: "image/png",
                gameId: "genshin-impact",
                assetCategoryId: "splash-art",
                url: "/test/image.png",
                status: "approved",
                uploadedById: newUsers[1].id,
                assetIsOptimized: 0,
                viewCount: 1337,
                downloadCount: 1337,
                fileSize: 40213,
                width: 1920,
                height: 1080,
            },
        ])
        .returning()
    console.log(`[asset] inserted ${newAssets.length} rows\n`)

    console.log("[assetTagAsset] Linking assets to asset tags...")
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
        ])
        .returning()
    console.log(`[assetTagAsset] inserted ${newAssetTagAsset.length} rows\n`)

    console.log("[userCollection] Seeding user collections...")
    const newUserCollections = await db
        .insert(userCollection)
        .values({
            name: "collection name",
            description: "collection description",
            userId: newUsers[0].id,
            isPublic: 0, // default to private
        })
        .returning()
    console.log(`[userCollection] inserted ${newUserCollections.length} rows\n`)

    console.log("[userCollectionAsset] Linking user collections to assets...")
    const newUserCollectionAssets = await db
        .insert(userCollectionAsset)
        .values([
            {
                collectionId: newUserCollections[0].id,
                assetId: newAssets[0].id,
            },
            {
                collectionId: newUserCollections[0].id,
                assetId: newAssets[1].id,
            },
        ])
        .returning()
    console.log(
        `[userCollectionAsset] inserted ${newUserCollectionAssets.length} rows\n`
    )

    // only one user favorite per user
    console.log("[userFavorite] Seeding user favorites...")
    const newUserFavorites = await db
        .insert(userFavorite)
        .values([
            {
                userId: newUsers[0].id,
            },
            {
                userId: newUsers[1].id,
                isPublic: 1,
            },
        ])
        .returning()
    console.log(`[userFavorite] inserted ${newUserFavorites.length} rows\n`)

    console.log("[userFavoriteAsset] Linking user favorites to assets...")
    const newUserFavoriteAssets = await db
        .insert(userFavoriteAsset)
        .values([
            {
                userFavoriteId: newUserFavorites[0].id,
                assetId: newAssets[0].id,
            },
            {
                userFavoriteId: newUserFavorites[0].id,
                assetId: newAssets[1].id,
            },
            {
                userFavoriteId: newUserFavorites[1].id,
                assetId: newAssets[2].id,
            },
        ])
        .returning()
    console.log(
        `[userFavoriteAsset] inserted ${newUserFavoriteAssets.length} rows\n`
    )

    console.log("Seeded database successfully")
    process.exit(0)
}

main().catch((err) => {
    console.error(`Error: ${err}`)
    process.exit(1)
})
