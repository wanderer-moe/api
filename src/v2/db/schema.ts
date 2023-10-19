import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"

// TODO: move tables into seperate appropiate files
export const users = sqliteTable(
    tableNames.authUser,
    {
        id: text("id").primaryKey(),
        avatarUrl: text("avatar_url"),
        bannerUrl: text("banner_url"),
        displayName: text("display_name"),
        username: text("username").notNull(),
        usernameColour: text("username_colour"),
        email: text("email").notNull(),
        emailVerified: integer("email_verified").default(0).notNull(),
        pronouns: text("pronouns"),
        verified: integer("verified").default(0).notNull(),
        bio: text("bio").default("No bio set").notNull(),
        dateJoined: text("date_joined").notNull(),
        roleFlags: integer("role_flags").default(1).notNull(),
        isContributor: integer("is_contributor").default(0).notNull(),
        selfAssignableRoleFlags: integer("self_assignable_role_flags")
            .default(0)
            .notNull(),
    },
    (user) => {
        return {
            userIdx: index("user_id_idx").on(user.id),
            usernameIdx: index("user_username_idx").on(user.username),
            emailIdx: index("user_email_idx").on(user.email),
        }
    }
)

export const emailVerificationToken = sqliteTable(
    tableNames.emailVerificationToken,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: integer("expires_at").notNull(),
    },
    (emailVerificationToken) => {
        return {
            userIdx: index("email_verification_token_user_id_idx").on(
                emailVerificationToken.userId
            ),
            tokenIdx: index("email_verification_token_token_idx").on(
                emailVerificationToken.token
            ),
        }
    }
)

export const passwordResetToken = sqliteTable(
    tableNames.passwordResetToken,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: integer("expires_at").notNull(),
    },
    (passwordResetToken) => {
        return {
            userIdx: index("password_reset_token_user_id_idx").on(
                passwordResetToken.userId
            ),
            tokenIdx: index("password_reset_token_token_idx").on(
                passwordResetToken.token
            ),
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
            userIdx: index("key_user_id_idx").on(key.userId),
        }
    }
)

export const userNetworking = sqliteTable(
    tableNames.userNetworking,
    {
        followerId: text("followerId")
            .notNull()
            .references(() => users.id),
        followingId: text("followingId")
            .notNull()
            .references(() => users.id),
        createdAt: text("createdAt").notNull(),
        updatedAt: text("updatedAt").notNull(),
    },
    (userNetworking) => {
        return {
            followerIdx: index("userNetworking_follower_idx").on(
                userNetworking.followerId
            ),
            followingIdx: index("userNetworking_following_idx").on(
                userNetworking.followingId
            ),
        }
    }
)

export const socialsConnection = sqliteTable(
    tableNames.socialsConnection,
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
            userIdx: index("socials_connection_user_id_idx").on(
                socialsConnection.userId
            ),
            discordIdIdx: index("socials_connection_discord_id_idx").on(
                socialsConnection.discordId
            ),
        }
    }
)

export const game = sqliteTable(
    tableNames.game,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g genshin-impact, honkai-impact-3rd
        formattedName: text("formatted_name").notNull(), // e.g Genshin Impact, Honkai Impact 3rd
        assetCount: integer("asset_count").default(0),
        possibleSuggestiveContent: integer("possible_suggestive_content")
            .default(0)
            .notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (game) => {
        return {
            gameIdx: index("game_id_idx").on(game.id),
            nameIdx: index("game_name_idx").on(game.name),
        }
    }
)

export const assetCategory = sqliteTable(
    tableNames.assetCategory,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g tcg-sheets, splash-art
        formattedName: text("formatted_name").notNull(), // e.g TCG Sheets, Splash Art
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetCategory) => {
        return {
            assetCategoryIdx: index("asset_category_id_idx").on(
                assetCategory.id
            ),
            nameIdx: index("asset_category_name_idx").on(assetCategory.name),
        }
    }
)

export const gameAssetCategory = sqliteTable(
    tableNames.gameAssetCategory,
    {
        id: text("id").primaryKey(),
        gameId: text("game_id")
            .notNull()
            .references(() => game.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetCategoryId: text("asset_category_id")
            .notNull()
            .references(() => assetCategory.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (gameAssetCategory) => {
        return {
            gameAssetCategoryIdx: index("game_asset_category_id_idx").on(
                gameAssetCategory.id
            ),
            gameAssetCategoryGameIdx: index(
                "game_asset_category_game_id_idx"
            ).on(gameAssetCategory.gameId),
            gameAssetCategoryAssetCategoryIdx: index(
                "game_asset_category_asset_category_id_idx"
            ).on(gameAssetCategory.assetCategoryId),
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
            .references(() => game.name, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetCategory: text("asset_category")
            .notNull()
            .references(() => assetCategory.name, {
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
            idIdx: index("assets_id_idx").on(table.id),
            nameIdx: index("assets_name_idx").on(table.name),
            gameIdx: index("assets_game_idx").on(table.game),
            assetCategoryIdx: index("assets_asset_category_idx").on(
                table.assetCategory
            ),
            uploadedByIdIdx: index("assets_uploaded_by_idx").on(
                table.uploadedById
            ),
            uploadedByNameIdx: index("assets_uploaded_by_name_idx").on(
                table.uploadedByName
            ),
        }
    }
)

export const assetTag = sqliteTable(
    tableNames.assetTag,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        formattedName: text("formatted_name").notNull(),
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetTag) => {
        return {
            assetTagIdx: index("asset_tag_id_idx").on(assetTag.id),
            nameIdx: index("asset_tag_name_idx").on(assetTag.name),
        }
    }
)

export const assetTagAsset = sqliteTable(
    tableNames.assetTagAsset,
    {
        id: text("id").primaryKey(),
        assetTagId: text("asset_tag_id")
            .notNull()
            .references(() => assetTag.id, {
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
    (assetTagAsset) => {
        return {
            assetTagAssetIdx: index("asset_tags_assets_id_idx").on(
                assetTagAsset.id
            ),
            assetTagAssetAssetTagIdx: index(
                "asset_tags_assets_asset_tag_id_idx"
            ).on(assetTagAsset.assetTagId),
            assetTagAssetAssetIdx: index("asset_tags_assets_asset_id_idx").on(
                assetTagAsset.assetId
            ),
        }
    }
)

export const userFavorite = sqliteTable(
    tableNames.userFavorite,
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
    (userFavorite) => {
        return {
            favoritedAssetsIdx: index("favorited_assets_id_idx").on(
                userFavorite.id
            ),
            favoritedAssetsUserIdx: index("favorited_assets_user_id_idx").on(
                userFavorite.userId
            ),
        }
    }
)

export const userFavoriteAsset = sqliteTable(
    tableNames.userFavoriteAsset,
    {
        id: text("id").primaryKey(),
        userFavoriteId: text("favorited_assets_id")
            .notNull()
            .references(() => userFavorite.id, {
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
    (userFavoriteAsset) => {
        return {
            favoritedAssetsAssetsIdx: index(
                "favorited_assets_assets_id_idx"
            ).on(userFavoriteAsset.id),
            favoritedAssetsAssetsUserIdx: index(
                "favorited_assets_assets_user_id_idx"
            ).on(userFavoriteAsset.userFavoriteId),
            favoritedAssetsAssetsAssetIdx: index(
                "favorited_assets_assets_asset_id_idx"
            ).on(userFavoriteAsset.assetId),
        }
    }
)

export const userCollection = sqliteTable(
    tableNames.userCollection,
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
        dateCreated: text("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
    },
    (collection) => {
        return {
            collectionIdx: index("collection_id_idx").on(collection.id),
            userCollectionIdx: index("user_collection_id_idx").on(
                collection.userId
            ),
        }
    }
)

export const userCollectionAsset = sqliteTable(
    tableNames.userCollectionAsset,
    {
        id: text("id").primaryKey(),
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollection.id, {
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
            collectionAssetsIdx: index("collection_assets_id_idx").on(
                collectionAssets.id
            ),
            collectionAssetsCollectionIdx: index(
                "collection_assets_collection_id_idx"
            ).on(collectionAssets.collectionId),
            collectionAssetsAssetIdx: index(
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
        dateCreated: text("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
        content: text("content").notNull(),
        savedColorPalette: text("saved_color_palette"), // array of 5 hex values, completely optional for the user to save
        sakuraUrl: text("sakura_url"),
    },
    (savedOcGenerators) => {
        return {
            savedOcGeneratorsIdx: index("saved_oc_generators_id_idx").on(
                savedOcGenerators.id
            ),
            savedOcGeneratorsUserIdx: index(
                "saved_oc_generators_user_id_idx"
            ).on(savedOcGenerators.userId),
        }
    }
)

// relations
export const gameRelations = relations(game, ({ many }) => ({
    assets: many(assets),
    gameAssetCategory: many(gameAssetCategory),
}))

export const assetRelations = relations(assets, ({ one, many }) => ({
    uploadedBy: one(users, {
        fields: [assets.uploadedById, assets.uploadedByName],
        references: [users.id, users.username],
    }),
    assetTagAsset: many(assetTagAsset),
    assetCategory: one(assetCategory, {
        fields: [assets.assetCategory],
        references: [assetCategory.name],
    }),
    game: one(game, {
        fields: [assets.game],
        references: [game.name],
    }),
}))

export const assetCategoryRelations = relations(assetCategory, ({ many }) => ({
    assets: many(assets),
    gameAssetCategory: many(gameAssetCategory),
}))

export const gameAssetCategoryRelations = relations(
    gameAssetCategory,
    ({ one }) => ({
        game: one(game, {
            fields: [gameAssetCategory.gameId],
            references: [game.id],
        }),
        assetCategory: one(assetCategory, {
            fields: [gameAssetCategory.assetCategoryId],
            references: [assetCategory.id],
        }),
    })
)

export const assetTagAssetRelations = relations(assetTagAsset, ({ one }) => ({
    assetTag: one(assetTag, {
        fields: [assetTagAsset.assetTagId],
        references: [assetTag.id],
    }),
    asset: one(assets, {
        fields: [assetTagAsset.assetId],
        references: [assets.id],
    }),
}))

export const userNetworkingRelations = relations(userNetworking, ({ one }) => ({
    follower: one(users, {
        fields: [userNetworking.followerId],
        references: [users.id],
        relationName: "followers",
    }),
    following: one(users, {
        fields: [userNetworking.followingId],
        references: [users.id],
        relationName: "following",
    }),
}))

export const collectionRelations = relations(
    userCollection,
    ({ one, many }) => ({
        user: one(users, {
            fields: [userCollection.userId],
            references: [users.id],
        }),
        assets: many(userCollectionAsset),
    })
)

export const collectionAssetsRelations = relations(
    userCollectionAsset,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionAsset.collectionId],
            references: [userCollection.id],
        }),
        asset: one(assets, {
            fields: [userCollectionAsset.assetId],
            references: [assets.id],
        }),
    })
)

export const userFavoriteRelations = relations(userFavorite, ({ one }) => ({
    user: one(users, {
        fields: [userFavorite.userId],
        references: [users.id],
    }),
}))

export const userFavoriteAssetRelations = relations(
    userFavoriteAsset,
    ({ one }) => ({
        favoritedAssets: one(userFavorite, {
            fields: [userFavoriteAsset.userFavoriteId],
            references: [userFavorite.id],
        }),
        asset: one(assets, {
            fields: [userFavoriteAsset.assetId],
            references: [assets.id],
        }),
    })
)

export const keysRelations = relations(keys, ({ one }) => ({
    user: one(users, {
        fields: [keys.userId],
        references: [users.id],
    }),
}))

export const socialsConnectionRelations = relations(
    socialsConnection,
    ({ one }) => ({
        user: one(users, {
            fields: [socialsConnection.userId],
            references: [users.id],
        }),
    })
)

export const usersRelations = relations(users, ({ one, many }) => ({
    key: many(keys),
    assets: many(assets),
    follower: many(userNetworking, { relationName: "follower" }),
    following: many(userNetworking, { relationName: "following" }),
    userFavorite: one(userFavorite),
    socialsConnection: one(socialsConnection),
    userCollection: many(userCollection),
    passwordResetToken: one(passwordResetToken),
    emailVerificationToken: one(emailVerificationToken),
    savedOcGenerators: many(savedOcGenerators),
}))

// export types

// game, asset types
export type Game = typeof game.$inferSelect
export type AssetCategory = typeof assetCategory.$inferSelect
export type GameAssetCategory = typeof gameAssetCategory.$inferSelect
export type Asset = typeof assets.$inferSelect
export type AssetTag = typeof assetTag.$inferSelect
export type AssetTagAsset = typeof assetTagAsset.$inferSelect

// user types
export type User = typeof users.$inferSelect
export type EmailVerificationToken = typeof emailVerificationToken.$inferSelect
export type PasswordResetToken = typeof passwordResetToken.$inferSelect
export type Key = typeof keys.$inferSelect
export type UserNetworking = typeof userNetworking.$inferSelect
export type SocialsConnection = typeof socialsConnection.$inferSelect
export type UserFavorite = typeof userFavorite.$inferSelect
export type UserFavoriteAsset = typeof userFavoriteAsset.$inferSelect
export type UserCollection = typeof userCollection.$inferSelect
export type UserCollectionAsset = typeof userCollectionAsset.$inferSelect
