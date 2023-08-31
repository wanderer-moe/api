import { tableNames } from "@/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/sqlite-core"

// users, games, categories, assets etc, i will clean this up later, sorry for anyone looking at this
export const users = sqliteTable(
    tableNames.authUser,
    {
        id: text("id").primaryKey(),
        avatarUrl: text("avatar_url"),
        bannerUrl: text("banner_url"),
        username: text("username").notNull(),
        usernameColour: text("username_colour"),
        email: text("email").notNull(),
        emailVerified: integer("email_verified").default(0).notNull(),
        pronouns: text("pronouns"),
        verified: integer("verified").default(0).notNull(),
        bio: text("bio").default("No bio set").notNull(),
        dateJoined: integer("date_joined").notNull(),
        roleFlags: integer("role_flags").default(1).notNull(),
        isContributor: integer("is_contributor").default(0).notNull(),
        selfAssignableRoleFlags: integer("self_assignable_role_flags"),
    },
    (user) => {
        return {
            userIdx: uniqueIndex("user_idx").on(user.id),
            usernameIdx: uniqueIndex("username_idx").on(user.username),
            emailIdx: uniqueIndex("email_idx").on(user.email),
        }
    }
)

export const sessions = sqliteTable(
    tableNames.authSession,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        activeExpires: integer("active_expires").notNull(),
        idleExpires: integer("idle_expires").notNull(),
        userAgent: text("user_agent").notNull(),
        countryCode: text("country_code").notNull(),
    },
    (session) => {
        return {
            userIdx: uniqueIndex("session_user_idx").on(session.userId),
        }
    }
)

export const keys = sqliteTable(
    tableNames.authKey,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        hashedPassword: text("hashed_password"),
    },
    (key) => {
        return {
            userIdx: uniqueIndex("keys_user_idx").on(key.userId),
        }
    }
)

export const socialsConnection = sqliteTable(tableNames.socialsConnection, {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
    discordId: text("discord_id"),
})

export const games = sqliteTable(
    tableNames.games,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (game) => {
        return {
            gameIdx: uniqueIndex("game_idx").on(game.id),
            nameIdx: uniqueIndex("name_idx").on(game.name),
        }
    }
)

export const assetCategories = sqliteTable(
    tableNames.assetCategories,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g genshin-impact, honkai-impact-3rd
        formattedName: text("formatted_name").notNull(), // e.g Genshin Impact, Honkai Impact 3rd
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetCategory) => {
        return {
            assetCategoryIdx: uniqueIndex("asset_category_idx").on(
                assetCategory.id
            ),
            nameIdx: uniqueIndex("name_idx").on(assetCategory.name),
        }
    }
)

export const gameAssetCategories = sqliteTable(
    tableNames.gameAssetCategories,
    {
        id: text("id").primaryKey(),
        gameId: text("game_id")
            .notNull()
            .references(() => games.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetCategoryId: text("asset_category_id")
            .notNull()
            .references(() => assetCategories.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (gameAssetCategory) => {
        return {
            gameAssetCategoryIdx: uniqueIndex("game_asset_category_idx").on(
                gameAssetCategory.id
            ),
            gameIdx: uniqueIndex("game_idx").on(gameAssetCategory.gameId),
            assetCategoryIdx: uniqueIndex("asset_category_idx").on(
                gameAssetCategory.assetCategoryId
            ),
        }
    }
)

export const assets = sqliteTable(
    tableNames.assets,
    {
        id: integer("id").primaryKey().notNull(), // primary key auto increments on sqlite
        name: text("name").notNull(),
        game: text("game")
            .notNull()
            .references(() => games.name, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetCategory: text("asset_category")
            .notNull()
            .references(() => assetCategories.name, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        tags: text("tags").notNull(),
        url: text("url").notNull(),
        status: text("status").notNull(),
        uploadedById: text("uploaded_by").references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
        uploadedDate: integer("uploaded_date").notNull(),
        viewCount: integer("view_count").default(0).notNull(),
        downloadCount: integer("download_count").default(0).notNull(),
        fileSize: integer("file_size").default(0).notNull(),
        width: integer("width").default(0).notNull(),
        height: integer("height").default(0).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("assets_id_idx").on(table.id),
            nameIdx: uniqueIndex("assets_name_idx").on(table.name),
            gameIdx: uniqueIndex("assets_game_idx").on(table.game),
            assetCategoryIdx: uniqueIndex("assets_asset_category_idx").on(
                table.assetCategory
            ),
            downloadCountIdx: uniqueIndex("assets_download_count_idx").on(
                table.downloadCount
            ),
            statusIdx: uniqueIndex("assets_status_idx").on(table.status),
            tagsIdx: uniqueIndex("assets_tags_idx").on(table.tags),
            uploadedByIdx: uniqueIndex("assets_uploaded_by_idx").on(
                table.uploadedById
            ),
        }
    }
)

export const following = sqliteTable(
    tableNames.following,
    {
        id: text("id").primaryKey(),
        followerId: text("follower_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        followingId: text("following_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (following) => {
        return {
            followerIdx: uniqueIndex("follower_idx").on(following.followerId),
            followingIdx: uniqueIndex("following_idx").on(
                following.followingId
            ),
        }
    }
)

export const follower = sqliteTable(
    tableNames.follower,
    {
        id: text("id").primaryKey(),
        followerId: text("follower_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        followingId: text("following_id").notNull(),
    },
    (follower) => {
        return {
            followerIdx: uniqueIndex("follower_idx").on(follower.followerId),
            followingIdx: uniqueIndex("following_idx").on(follower.followingId),
        }
    }
)

export const collections = sqliteTable(
    tableNames.assetCollection,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (collection) => {
        return {
            collectionIdx: uniqueIndex("collection_idx").on(collection.id),
            userCollectionIdx: uniqueIndex("user_collection_idx").on(
                collection.userId
            ),
        }
    }
)

export const collectionAssets = sqliteTable(
    tableNames.assetCollectionAsset,
    {
        collectionId: text("collection_id")
            .notNull()
            .references(() => collections.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetId: integer("asset_id")
            .notNull()
            .references(() => assets.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (collectionAsset) => {
        return {
            collectionAssetIdx: uniqueIndex("collection_asset_idx").on(
                collectionAsset.collectionId,
                collectionAsset.assetId
            ),
        }
    }
)

export const savedOcGenerators = sqliteTable(
    tableNames.savedOcGenerators,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        name: text("name").notNull(),
        game: text("game").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
        content: text("content").notNull(), // this is stored as json
    },
    (savedOcGenerators) => {
        return {
            savedOcGeneratorsIdx: uniqueIndex("saved_oc_generators_idx").on(
                savedOcGenerators.id
            ),
            savedOcGeneratorsUserIdx: uniqueIndex(
                "saved_oc_generators_user_idx"
            ).on(savedOcGenerators.userId),
        }
    }
)

// relations

export const gameRelations = relations(games, ({ many }) => ({
    assetCategories: many(gameAssetCategories),
}))

export const assetCategoryRelations = relations(
    assetCategories,
    ({ many }) => ({
        games: many(gameAssetCategories),
    })
)

export const assetRelations = relations(assets, ({ one }) => ({
    uploadedBy: one(users, {
        fields: [assets.uploadedById],
        references: [users.id],
    }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}))

export const keysRelations = relations(keys, ({ one }) => ({
    user: one(users, {
        fields: [keys.userId],
        references: [users.id],
    }),
}))

export const usersRelations = relations(users, ({ many }) => ({
    session: many(sessions),
    key: many(keys),
    assets: many(assets),
    follower: many(follower),
    following: many(following),
    collections: many(collections),
    savedOcGenerators: many(savedOcGenerators),
}))
