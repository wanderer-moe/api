import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/sqlite-core"

// TODO: move tables into seperate appropiate files
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
            userIdx: uniqueIndex("user_id_idx").on(user.id),
            usernameIdx: uniqueIndex("user_username_idx").on(user.username),
            emailIdx: uniqueIndex("user_email_idx").on(user.email),
        }
    }
)

// NOTE: sessions are now managed by CF KV instead of SQLite DB
// export const sessions = sqliteTable(
//     tableNames.authSession,
//     {
//         id: text("id").primaryKey(),
//         userId: text("user_id")
//             .notNull()
//             .references(() => users.id, {
//                 onUpdate: "cascade",
//                 onDelete: "cascade",
//             }),
//         activeExpires: integer("active_expires").notNull(),
//         idleExpires: integer("idle_expires").notNull(),
//         userAgent: text("user_agent").notNull(),
//         countryCode: text("country_code").notNull(),
//     },
//     (session) => {
//         return {
//             userIdx: uniqueIndex("session_user_id_idx").on(session.userId),
//         }
//     }
// )

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
            userIdx: uniqueIndex("key_user_id_idx").on(key.userId),
        }
    }
)

export const socialsConnections = sqliteTable(
    tableNames.socialsConnections,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        discordId: text("discord_id"),
    },
    (socialsConnection) => {
        return {
            userIdx: uniqueIndex("socials_connection_user_id_idx").on(
                socialsConnection.userId
            ),
            discordIdIdx: uniqueIndex("socials_connection_discord_id_idx").on(
                socialsConnection.discordId
            ),
        }
    }
)

export const games = sqliteTable(
    tableNames.games,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g genshin-impact, honkai-impact-3rd
        formattedName: text("formatted_name").notNull(), // e.g Genshin Impact, Honkai Impact 3rd
        assetCount: integer("asset_count").default(0),
        lastUpdated: integer("last_updated").notNull(),
    },
    (game) => {
        return {
            gameIdx: uniqueIndex("game_id_idx").on(game.id),
            nameIdx: uniqueIndex("game_name_idx").on(game.name),
        }
    }
)

export const assetCategories = sqliteTable(
    tableNames.assetCategories,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g tcg-sheets, splash-art
        formattedName: text("formatted_name").notNull(), // e.g TCG Sheets, Splash Art
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetCategory) => {
        return {
            assetCategoryIdx: uniqueIndex("asset_category_id_idx").on(
                assetCategory.id
            ),
            nameIdx: uniqueIndex("asset_category_name_idx").on(
                assetCategory.name
            ),
        }
    }
)

export const assets = sqliteTable(
    tableNames.assets,
    {
        id: integer("id").primaryKey(), // primary key auto increments on sqlite
        name: text("name").notNull(),
        extension: text("extension").notNull(),
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
        url: text("url").notNull(),
        status: integer("status").notNull(),
        uploadedById: text("uploaded_by").references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
        uploadedByName: text("uploaded_by_name").references(
            () => users.username,
            {
                onUpdate: "cascade",
                onDelete: "cascade",
            }
        ),
        uploadedDate: integer("uploaded_date").notNull(),
        assetIsOptimized: integer("asset_is_optimized").default(0).notNull(),
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
            uploadedByIdIdx: uniqueIndex("assets_uploaded_by_idx").on(
                table.uploadedById
            ),
            uploadedByNameIdx: uniqueIndex("assets_uploaded_by_name_idx").on(
                table.uploadedByName
            ),
        }
    }
)

export const assetTags = sqliteTable(
    tableNames.assetTags,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        formattedName: text("formatted_name").notNull(),
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetTag) => {
        return {
            assetTagIdx: uniqueIndex("asset_tag_id_idx").on(assetTag.id),
            nameIdx: uniqueIndex("asset_tag_name_idx").on(assetTag.name),
        }
    }
)

export const assetTagsAssets = sqliteTable(
    tableNames.assetTagsAssets,
    {
        id: text("id").primaryKey(),
        assetTagId: text("asset_tag_id")
            .notNull()
            .references(() => assetTags.id, {
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
    (assetTagsAssets) => {
        return {
            assetTagsAssetsIdx: uniqueIndex("asset_tags_assets_id_idx").on(
                assetTagsAssets.id
            ),
            assetTagsAssetsAssetTagIdx: uniqueIndex(
                "asset_tags_assets_asset_tag_id_idx"
            ).on(assetTagsAssets.assetTagId),
            assetTagsAssetsAssetIdx: uniqueIndex(
                "asset_tags_assets_asset_id_idx"
            ).on(assetTagsAssets.assetId),
        }
    }
)

export const following = sqliteTable(tableNames.following, {
    id: text("id").primaryKey(),
    followerUserId: text("follower_id")
        .notNull()
        .references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
    followingUserId: text("following_id")
        .notNull()
        .references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
})

export const follower = sqliteTable(tableNames.follower, {
    id: text("id").primaryKey(),
    followerUserId: text("follower_id")
        .notNull()
        .references(() => users.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
    followingUserId: text("following_id")
        .notNull()
        .references(() => users.id),
})

export const userFavorites = sqliteTable(
    tableNames.userFavorites,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        isPublic: integer("is_public").default(0).notNull(),
    },
    (userFavorites) => {
        return {
            favoritedAssetsIdx: uniqueIndex("favorited_assets_id_idx").on(
                userFavorites.id
            ),
            favoritedAssetsUserIdx: uniqueIndex(
                "favorited_assets_user_id_idx"
            ).on(userFavorites.userId),
        }
    }
)

export const userFavoritesAssets = sqliteTable(
    tableNames.userFavoritesAssets,
    {
        id: text("id").primaryKey(),
        userFavoritesId: text("favorited_assets_id")
            .notNull()
            .references(() => userFavorites.id, {
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
    (userFavoritesAssets) => {
        return {
            favoritedAssetsAssetsIdx: uniqueIndex(
                "favorited_assets_assets_id_idx"
            ).on(userFavoritesAssets.id),
            favoritedAssetsAssetsUserIdx: uniqueIndex(
                "favorited_assets_assets_user_id_idx"
            ).on(userFavoritesAssets.userFavoritesId),
            favoritedAssetsAssetsAssetIdx: uniqueIndex(
                "favorited_assets_assets_asset_id_idx"
            ).on(userFavoritesAssets.assetId),
        }
    }
)

export const userCollections = sqliteTable(
    tableNames.userCollections,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        description: text("description").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        dateCreated: integer("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
    },
    (collection) => {
        return {
            collectionIdx: uniqueIndex("collection_id_idx").on(collection.id),
            userCollectionIdx: uniqueIndex("user_collection_id_idx").on(
                collection.userId
            ),
        }
    }
)

export const userCollectionAssets = sqliteTable(
    tableNames.userCollectionAssets,
    {
        id: text("id").primaryKey(),
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollections.id, {
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
    (collectionAssets) => {
        return {
            collectionAssetsIdx: uniqueIndex("collection_assets_id_idx").on(
                collectionAssets.id
            ),
            collectionAssetsCollectionIdx: uniqueIndex(
                "collection_assets_collection_id_idx"
            ).on(collectionAssets.collectionId),
            collectionAssetsAssetIdx: uniqueIndex(
                "collection_assets_asset_id_idx"
            ).on(collectionAssets.assetId),
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
        dateCreated: integer("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
        content: text("content").notNull(), // this is stored as json, which is then parsed on the frontend
        savedColorPalette: text("saved_color_palette"), // array of 5 hex values, completely optional
    },
    (savedOcGenerators) => {
        return {
            savedOcGeneratorsIdx: uniqueIndex("saved_oc_generators_id_idx").on(
                savedOcGenerators.id
            ),
            savedOcGeneratorsUserIdx: uniqueIndex(
                "saved_oc_generators_user_id_idx"
            ).on(savedOcGenerators.userId),
        }
    }
)

// relations
export const gameRelations = relations(games, ({ many }) => ({
    assets: many(assets),
}))

export const assetRelations = relations(assets, ({ one, many }) => ({
    uploadedBy: one(users, {
        fields: [assets.uploadedById, assets.uploadedByName],
        references: [users.id, users.username],
    }),
    assetTagsAssets: many(assetTagsAssets),
    assetCategory: one(assetCategories, {
        fields: [assets.assetCategory],
        references: [assetCategories.name],
    }),
    game: one(games, {
        fields: [assets.game],
        references: [games.name],
    }),
}))

export const assetCategoryRelations = relations(
    assetCategories,
    ({ many }) => ({
        assets: many(assets),
    })
)

export const assetTagsAssetsRelations = relations(
    assetTagsAssets,
    ({ one }) => ({
        assetTag: one(assetTags, {
            fields: [assetTagsAssets.assetTagId],
            references: [assetTags.id],
        }),
        asset: one(assets, {
            fields: [assetTagsAssets.assetId],
            references: [assets.id],
        }),
    })
)

export const collectionRelations = relations(
    userCollections,
    ({ one, many }) => ({
        user: one(users, {
            fields: [userCollections.userId],
            references: [users.id],
        }),
        assets: many(userCollectionAssets),
    })
)

export const collectionAssetsRelations = relations(
    userCollectionAssets,
    ({ one }) => ({
        collection: one(userCollections, {
            fields: [userCollectionAssets.collectionId],
            references: [userCollections.id],
        }),
        asset: one(assets, {
            fields: [userCollectionAssets.assetId],
            references: [assets.id],
        }),
    })
)

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
    user: one(users, {
        fields: [userFavorites.userId],
        references: [users.id],
    }),
}))

export const userFavoritesAssetsRelations = relations(
    userFavoritesAssets,
    ({ one }) => ({
        favoritedAssets: one(userFavorites, {
            fields: [userFavoritesAssets.userFavoritesId],
            references: [userFavorites.id],
        }),
        asset: one(assets, {
            fields: [userFavoritesAssets.assetId],
            references: [assets.id],
        }),
    })
)

// export const sessionsRelations = relations(sessions, ({ one }) => ({
//     user: one(users, {
//         fields: [sessions.userId],
//         references: [users.id],
//     }),
// }))

export const keysRelations = relations(keys, ({ one }) => ({
    user: one(users, {
        fields: [keys.userId],
        references: [users.id],
    }),
}))

export const socialsConnectionsRelations = relations(
    socialsConnections,
    ({ one }) => ({
        user: one(users, {
            fields: [socialsConnections.userId],
            references: [users.id],
        }),
    })
)

export const usersRelations = relations(users, ({ one, many }) => ({
    // session: many(sessions),
    key: many(keys),
    assets: many(assets),
    follower: many(follower),
    userFavorites: one(userFavorites),
    following: many(following),
    socialsConnection: one(socialsConnections),
    userCollections: many(userCollections),
    savedOcGenerators: many(savedOcGenerators),
}))

// export types

// game, asset types
export type Game = typeof games.$inferSelect
export type AssetCategory = typeof assetCategories.$inferSelect
export type Asset = typeof assets.$inferSelect
export type AssetTag = typeof assetTags.$inferSelect
export type AssetTagsAsset = typeof assetTagsAssets.$inferSelect

// user types
export type User = typeof users.$inferSelect
// export type Session = typeof sessions.$inferSelect
export type Key = typeof keys.$inferSelect
export type SocialsConnection = typeof socialsConnections.$inferSelect
export type Following = typeof following.$inferSelect
export type Follower = typeof follower.$inferSelect
export type UserFavorites = typeof userFavorites.$inferSelect
export type UserFavoritesAssets = typeof userFavoritesAssets.$inferSelect
export type UserCollections = typeof userCollections.$inferSelect
export type UserCollectionAssets = typeof userCollectionAssets.$inferSelect
