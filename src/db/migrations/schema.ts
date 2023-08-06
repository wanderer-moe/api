import {
    mysqlTable,
    index,
    primaryKey,
    int,
    varchar,
    mysqlEnum,
    unique,
    bigint,
    datetime,
} from "drizzle-orm/mysql-core";
import { tableNames } from "@/lib/drizzle";
// import { sql } from "drizzle-orm";

export const assets = mysqlTable(
    tableNames.assets,
    {
        id: int("id").autoincrement().notNull(),
        name: varchar("name", { length: 191 }).notNull(),
        game: varchar("game", { length: 191 }).notNull(),
        assetCategory: varchar("asset_category", { length: 191 }).notNull(),
        tags: mysqlEnum("tags", ["OFFICIAL", "FANMADE"])
            .default("OFFICIAL")
            .notNull(),
        url: varchar("url", { length: 191 }).notNull(),
        status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED"])
            .default("PENDING")
            .notNull(),
        uploadedBy: varchar("uploaded_by", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        uploadedDate: varchar("uploaded_date", { length: 191 }).notNull(),
        viewCount: int("view_count").default(0).notNull(),
        downloadCount: int("download_count").default(0).notNull(),
        fileSize: int("file_size").notNull(),
        width: int("width").default(0).notNull(),
        height: int("height").default(0).notNull(),
    },
    (table) => {
        return {
            idIdx: index("assets_id_idx").on(table.id),
            nameIdx: index("assets_name_idx").on(table.name),
            gameIdx: index("assets_game_idx").on(table.game),
            statusIdx: index("assets_status_idx").on(table.status),
            tagsIdx: index("assets_tags_idx").on(table.tags),
            uploadedByIdx: index("assets_uploaded_by_idx").on(table.uploadedBy),
            assetsId: primaryKey(table.id),
        };
    }
);

export const authKey = mysqlTable(
    tableNames.authKey,
    {
        id: varchar("id", { length: 191 }).notNull(),
        hashedPassword: varchar("hashed_password", { length: 191 }),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
    },
    (table) => {
        return {
            userIdIdx: index("authKey_user_id_idx").on(table.userId),
            authKeyId: primaryKey(table.id),
            authKeyIdKey: unique("authKey_id_key").on(table.id),
        };
    }
);

export const authSession = mysqlTable(
    tableNames.authSession,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
        idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index("authSession_user_id_idx").on(table.userId),
            authSessionId: primaryKey(table.id),
            authSessionIdKey: unique("authSession_id_key").on(table.id),
        };
    }
);

export const authUser = mysqlTable(
    tableNames.authUser,
    {
        id: varchar("id", { length: 191 }).notNull(),
        avatarUrl: varchar("avatar_url", { length: 191 }),
        bannerUrl: varchar("banner_url", { length: 191 }),
        username: varchar("username", { length: 191 }).notNull(),
        usernameColour: varchar("username_colour", { length: 191 }),
        email: varchar("email", { length: 191 }).notNull(),
        emailVerified: int("email_verified").default(0).notNull(),
        pronouns: varchar("pronouns", { length: 191 }),
        verified: int("verified").default(0).notNull(),
        bio: varchar("bio", { length: 191 }).default(""),
        dateJoined: datetime("date_joined", {
            mode: "string",
            fsp: 3,
        }).notNull(),
        roleFlags: int("role_flags").default(1).notNull(),
        selfAssignableRoleFlags: int("self_assignable_role_flags"),
    },
    (table) => {
        return {
            authUserId: primaryKey(table.id),
            authUserIdKey: unique("authUser_id_key").on(table.id),
            authUserUsernameKey: unique("authUser_username_key").on(
                table.username
            ),
            authUserEmailKey: unique("authUser_email_key").on(table.email),
        };
    }
);

export const emailVerificationToken = mysqlTable(
    tableNames.emailVerificationToken,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        expires: bigint("expires", { mode: "number" }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index("emailVerificationToken_user_id_idx").on(
                table.userId
            ),
            emailVerificationTokenId: primaryKey(table.id),
            emailVerificationTokenIdKey: unique(
                "emailVerificationToken_id_key"
            ).on(table.id),
        };
    }
);

export const follower = mysqlTable(
    tableNames.follower,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
    },
    (table) => {
        return {
            userIdIdx: index("follower_user_id_idx").on(table.userId),
            followerId: primaryKey(table.id),
            followerIdKey: unique("follower_id_key").on(table.id),
        };
    }
);

export const following = mysqlTable(
    tableNames.following,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index("following_user_id_idx").on(table.userId),
            followingId: primaryKey(table.id),
            followingIdKey: unique("following_id_key").on(table.id),
        };
    }
);

export const games = mysqlTable(
    tableNames.games,
    {
        id: int("id").autoincrement().notNull(),
        name: varchar("name", { length: 191 }).notNull(),
        assetCount: int("asset_count").default(0).notNull(),
        assetCategories: varchar("asset_categories", { length: 191 }) // minor inconvenience
            .default("")
            .notNull(),
        lastUpdated: datetime("last_updated", {
            mode: "string",
            fsp: 3,
        }).notNull(),
        categoryCount: int("category_count").default(0).notNull(),
    },
    (table) => {
        return {
            idIdx: index("games_id_idx").on(table.id),
            nameIdx: index("games_name_idx").on(table.name),
            gamesId: primaryKey(table.id),
        };
    }
);

export const passwordResetToken = mysqlTable(
    tableNames.passwordResetToken,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        expires: bigint("expires", { mode: "number" }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index("passwordResetToken_user_id_idx").on(table.userId),
            passwordResetTokenId: primaryKey(table.id),
            passwordResetTokenIdKey: unique("passwordResetToken_id_key").on(
                table.id
            ),
        };
    }
);

export const savedOcGenerators = mysqlTable(
    tableNames.savedOcGenerators,
    {
        id: int("id").autoincrement().notNull(),
        game: varchar("game", { length: 191 }).notNull(),
        data: varchar("data", { length: 191 }).notNull(), // data will be stored in opt index -> response index e.g 1:1,2:4,3:1,4:2
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        savedDate: datetime("saved_date", { mode: "string", fsp: 3 }).notNull(),
    },
    (table) => {
        return {
            idIdx: index("savedOCGenerators_id_idx").on(table.id),
            gameIdx: index("savedOCGenerators_game_idx").on(table.game),
            userIdIdx: index("savedOCGenerators_user_id_idx").on(table.userId),
            savedOcGeneratorsId: primaryKey(table.id),
        };
    }
);

export const socialsConnection = mysqlTable(
    tableNames.socialsConnection,
    {
        id: varchar("id", { length: 191 }).notNull(),
        userId: varchar("user_id", { length: 191 })
            .notNull()
            .references(() => authUser.id),
        tiktok: varchar("tiktok", { length: 191 }),
        discord: varchar("discord", { length: 191 }),
    },
    (table) => {
        return {
            userIdIdx: index("socialsConnection_user_id_idx").on(table.userId),
            socialsConnectionId: primaryKey(table.id),
            socialsConnectionIdKey: unique("socialsConnection_id_key").on(
                table.id
            ),
        };
    }
);
