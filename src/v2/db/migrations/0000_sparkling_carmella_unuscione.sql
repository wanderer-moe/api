CREATE TABLE `asset` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`extension` text NOT NULL,
	`game` text NOT NULL,
	`asset_category` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`uploaded_date` text NOT NULL,
	`asset_is_optimized` integer DEFAULT 0 NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`width` integer DEFAULT 0 NOT NULL,
	`height` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game`) REFERENCES `game`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_category`) REFERENCES `assetCategory`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetCategory` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gameAssetCategory` (
	`game_id` text NOT NULL,
	`asset_category_id` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_category_id`) REFERENCES `assetCategory`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetTag` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assetTagAsset` (
	`asset_tag_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`asset_tag_id`) REFERENCES `assetTag`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `atlas` (
	`id` text NOT NULL,
	`url` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`uploaded_date` integer NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `atlasToAsset` (
	`id` text,
	`atlas_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`atlas_id`) REFERENCES `atlas`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0,
	`possible_suggestive_content` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `savedOcGenerators` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`game` text NOT NULL,
	`date_created` text NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	`content` text NOT NULL,
	`saved_color_palette` text,
	`sakura_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authUser` (
	`id` text NOT NULL,
	`avatar_url` text,
	`banner_url` text,
	`display_name` text,
	`username` text NOT NULL,
	`username_colour` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`pronouns` text,
	`verified` integer DEFAULT 0 NOT NULL,
	`bio` text DEFAULT 'No bio set' NOT NULL,
	`date_joined` text NOT NULL,
	`role_flags` integer DEFAULT 1 NOT NULL,
	`is_contributor` integer DEFAULT 0 NOT NULL,
	`self_assignable_role_flags` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `authKey` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emailVerificationToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollection` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`user_id` text NOT NULL,
	`date_created` text NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetCollectionAsset` (
	`id` text NOT NULL,
	`collection_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `socialsConnection` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`discord_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFavorite` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFavoriteAsset` (
	`id` text NOT NULL,
	`favorited_assets_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`favorited_assets_id`) REFERENCES `userFavorite`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userNetworking` (
	`followerId` text NOT NULL,
	`followingId` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`followerId`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`followingId`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assets_id_idx` ON `asset` (`id`);--> statement-breakpoint
CREATE INDEX `assets_name_idx` ON `asset` (`name`);--> statement-breakpoint
CREATE INDEX `assets_game_name_idx` ON `asset` (`game`);--> statement-breakpoint
CREATE INDEX `assets_asset_category_name_idx` ON `asset` (`asset_category`);--> statement-breakpoint
CREATE INDEX `assets_uploaded_by_id_idx` ON `asset` (`uploaded_by`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCategory_id_unique` ON `assetCategory` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCategory_name_unique` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `asset_category_id_idx` ON `assetCategory` (`id`);--> statement-breakpoint
CREATE INDEX `asset_category_name_idx` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `game_asset_category_game_id_idx` ON `gameAssetCategory` (`game_id`);--> statement-breakpoint
CREATE INDEX `game_asset_category_asset_category_id_idx` ON `gameAssetCategory` (`asset_category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetTag_id_unique` ON `assetTag` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetTag_name_unique` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tag_id_idx` ON `assetTag` (`id`);--> statement-breakpoint
CREATE INDEX `asset_tag_name_idx` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_tag_id_idx` ON `assetTagAsset` (`asset_tag_id`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_id_idx` ON `assetTagAsset` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atlas_id_unique` ON `atlas` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_id_idx` ON `atlas` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_uploaded_by_idx` ON `atlas` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `atlas_uploaded_by_name_idx` ON `atlas` (`uploaded_by_name`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_id_idx` ON `atlasToAsset` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_atlas_id_idx` ON `atlasToAsset` (`atlas_id`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_asset_id_idx` ON `atlasToAsset` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_id_unique` ON `game` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_name_unique` ON `game` (`name`);--> statement-breakpoint
CREATE INDEX `game_id_idx` ON `game` (`id`);--> statement-breakpoint
CREATE INDEX `game_name_idx` ON `game` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `savedOcGenerators_id_unique` ON `savedOcGenerators` (`id`);--> statement-breakpoint
CREATE INDEX `saved_oc_generators_id_idx` ON `savedOcGenerators` (`id`);--> statement-breakpoint
CREATE INDEX `saved_oc_generators_user_id_idx` ON `savedOcGenerators` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authUser_id_unique` ON `authUser` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authUser_username_unique` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `authUser` (`id`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `authUser` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `authKey_id_unique` ON `authKey` (`id`);--> statement-breakpoint
CREATE INDEX `key_user_id_idx` ON `authKey` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `emailVerificationToken_id_unique` ON `emailVerificationToken` (`id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_user_id_idx` ON `emailVerificationToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_token_idx` ON `emailVerificationToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `passwordResetToken_id_unique` ON `passwordResetToken` (`id`);--> statement-breakpoint
CREATE INDEX `password_reset_token_user_id_idx` ON `passwordResetToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `password_reset_token_token_idx` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `userCollection_id_unique` ON `userCollection` (`id`);--> statement-breakpoint
CREATE INDEX `collection_id_idx` ON `userCollection` (`id`);--> statement-breakpoint
CREATE INDEX `user_collection_id_idx` ON `userCollection` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCollectionAsset_id_unique` ON `assetCollectionAsset` (`id`);--> statement-breakpoint
CREATE INDEX `collection_assets_id_idx` ON `assetCollectionAsset` (`id`);--> statement-breakpoint
CREATE INDEX `collection_assets_collection_id_idx` ON `assetCollectionAsset` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_asset_id_idx` ON `assetCollectionAsset` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `socialsConnection_id_unique` ON `socialsConnection` (`id`);--> statement-breakpoint
CREATE INDEX `socials_connection_user_id_idx` ON `socialsConnection` (`user_id`);--> statement-breakpoint
CREATE INDEX `socials_connection_discord_id_idx` ON `socialsConnection` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userFavorite_id_unique` ON `userFavorite` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_id_idx` ON `userFavorite` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_user_id_idx` ON `userFavorite` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userFavoriteAsset_id_unique` ON `userFavoriteAsset` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_id_idx` ON `userFavoriteAsset` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_user_id_idx` ON `userFavoriteAsset` (`favorited_assets_id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_asset_id_idx` ON `userFavoriteAsset` (`asset_id`);--> statement-breakpoint
CREATE INDEX `userNetworking_follower_idx` ON `userNetworking` (`followerId`);--> statement-breakpoint
CREATE INDEX `userNetworking_following_idx` ON `userNetworking` (`followingId`);