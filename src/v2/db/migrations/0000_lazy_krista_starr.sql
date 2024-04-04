CREATE TABLE `asset` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`extension` text NOT NULL,
	`game` text NOT NULL,
	`asset_category` text NOT NULL,
	`uploaded_by_id` text NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`uploaded_date` text NOT NULL,
	`asset_is_suggestive` integer DEFAULT false NOT NULL,
	`comments_is_locked` integer DEFAULT false NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`width` integer DEFAULT 0 NOT NULL,
	`height` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game`) REFERENCES `game`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_category`) REFERENCES `assetCategory`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_name`) REFERENCES `authUser`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetComments` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`asset_id` text,
	`parent_comment_id` text,
	`commented_by_id` text NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	`edited_at` text DEFAULT null,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`commented_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_comment_id`) REFERENCES `assetComments`(`comment_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assetCommentsLikes` (
	`comment_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `assetComments`(`comment_id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetExternalFile` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`asset_id` text NOT NULL,
	`uploaded_date` text NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`file_type` text NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_name`) REFERENCES `authUser`(`username`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetLikes` (
	`asset_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetCategory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
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
CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`possible_suggestive_content` integer DEFAULT false NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assetTag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assetTagAsset` (
	`asset_tag_id` text NOT NULL,
	`asset_id` text NOT NULL,
	FOREIGN KEY (`asset_tag_id`) REFERENCES `assetTag`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authCredentials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authUser` (
	`id` text PRIMARY KEY NOT NULL,
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
	`plan` text DEFAULT 'free' NOT NULL,
	`is_banned` integer DEFAULT false NOT NULL,
	`is_contributor` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stripeUser` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`ends_at` text,
	`paid_until` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authSession` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`user_agent` text NOT NULL,
	`country_code` text NOT NULL,
	`ip_address` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emailVerificationToken` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollection` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`user_id` text NOT NULL,
	`date_created` text NOT NULL,
	`accent_colour` text,
	`is_public` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollectionAsset` (
	`collection_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`order` integer NOT NULL,
	`date_added` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `socialsConnection` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`discord_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFollowing` (
	`followerId` text NOT NULL,
	`followingId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`followerId`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`followingId`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userBlocked` (
	`id` text PRIMARY KEY NOT NULL,
	`blocked_by_id` text NOT NULL,
	`blocked_id` text NOT NULL,
	FOREIGN KEY (`blocked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`blocked_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollectionLikes` (
	`collection_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollectionCollaborators` (
	`collection_id` text NOT NULL,
	`collaborator_id` text NOT NULL,
	`role` text DEFAULT 'collaborator' NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collaborator_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `requestForm` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `requestFormUpvotes` (
	`id` text NOT NULL,
	`request_form_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`request_form_id`) REFERENCES `requestForm`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assets_id_idx` ON `asset` (`id`);--> statement-breakpoint
CREATE INDEX `assets_name_idx` ON `asset` (`name`);--> statement-breakpoint
CREATE INDEX `assets_game_name_idx` ON `asset` (`game`);--> statement-breakpoint
CREATE INDEX `assets_asset_category_name_idx` ON `asset` (`asset_category`);--> statement-breakpoint
CREATE INDEX `assets_uploaded_by_id_idx` ON `asset` (`uploaded_by_id`);--> statement-breakpoint
CREATE INDEX `assetcomments_asset_idx` ON `assetComments` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetcomments_parent_comment_idx` ON `assetComments` (`parent_comment_id`);--> statement-breakpoint
CREATE INDEX `assetcomments_commented_by_idx` ON `assetComments` (`commented_by_id`);--> statement-breakpoint
CREATE INDEX `assetcommentslikes_comment_idx` ON `assetCommentsLikes` (`comment_id`);--> statement-breakpoint
CREATE INDEX `assetcommentslikes_liked_by_idx` ON `assetCommentsLikes` (`liked_by_id`);--> statement-breakpoint
CREATE INDEX `asset_external_file_id_idx` ON `assetExternalFile` (`id`);--> statement-breakpoint
CREATE INDEX `asset_external_file_uploaded_by_id_idx` ON `assetExternalFile` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `asset_external_file_uploaded_by_name_idx` ON `assetExternalFile` (`uploaded_by_name`);--> statement-breakpoint
CREATE INDEX `assetlikes_asset_idx` ON `assetLikes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetlikes_likedBy_idx` ON `assetLikes` (`liked_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCategory_name_unique` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `asset_category_id_idx` ON `assetCategory` (`id`);--> statement-breakpoint
CREATE INDEX `asset_category_name_idx` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `game_asset_category_game_id_idx` ON `gameAssetCategory` (`game_id`);--> statement-breakpoint
CREATE INDEX `game_asset_category_asset_category_id_idx` ON `gameAssetCategory` (`asset_category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_name_unique` ON `game` (`name`);--> statement-breakpoint
CREATE INDEX `game_id_idx` ON `game` (`id`);--> statement-breakpoint
CREATE INDEX `game_name_idx` ON `game` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetTag_name_unique` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tag_id_idx` ON `assetTag` (`id`);--> statement-breakpoint
CREATE INDEX `asset_tag_name_idx` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_tag_id_idx` ON `assetTagAsset` (`asset_tag_id`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_id_idx` ON `assetTagAsset` (`asset_id`);--> statement-breakpoint
CREATE INDEX `key_user_id_idx` ON `authCredentials` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authUser_username_unique` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `authUser` (`id`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `authUser` (`email`);--> statement-breakpoint
CREATE INDEX `user_contributor_idx` ON `authUser` (`is_contributor`);--> statement-breakpoint
CREATE INDEX `stripe_user_user_id_idx` ON `stripeUser` (`user_id`);--> statement-breakpoint
CREATE INDEX `stripe_user_stripe_customer_id_idx` ON `stripeUser` (`stripe_customer_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `authSession` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_user_id_idx` ON `emailVerificationToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_token_idx` ON `emailVerificationToken` (`token`);--> statement-breakpoint
CREATE INDEX `password_reset_token_user_id_idx` ON `passwordResetToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `password_reset_token_token_idx` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE INDEX `collection_id_idx` ON `userCollection` (`id`);--> statement-breakpoint
CREATE INDEX `user_collection_id_idx` ON `userCollection` (`user_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_collection_id_idx` ON `userCollectionAsset` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_asset_id_idx` ON `userCollectionAsset` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `socialsConnection_user_id_unique` ON `socialsConnection` (`user_id`);--> statement-breakpoint
CREATE INDEX `socials_connection_user_id_idx` ON `socialsConnection` (`user_id`);--> statement-breakpoint
CREATE INDEX `socials_connection_discord_id_idx` ON `socialsConnection` (`discord_id`);--> statement-breakpoint
CREATE INDEX `userfollowing_follower_idx` ON `userFollowing` (`followerId`);--> statement-breakpoint
CREATE INDEX `userfollowing_following_idx` ON `userFollowing` (`followingId`);--> statement-breakpoint
CREATE INDEX `user_blocked_id_idx` ON `userBlocked` (`id`);--> statement-breakpoint
CREATE INDEX `user_blocked_blocked_by_id_idx` ON `userBlocked` (`blocked_by_id`);--> statement-breakpoint
CREATE INDEX `user_blocked_blocked_id_idx` ON `userBlocked` (`blocked_id`);--> statement-breakpoint
CREATE INDEX `userCollectionNetworking_collection_idx` ON `userCollectionLikes` (`collection_id`);--> statement-breakpoint
CREATE INDEX `userCollectionNetworking_likedBy_idx` ON `userCollectionLikes` (`liked_by_id`);--> statement-breakpoint
CREATE INDEX `userCollectionCollaborators_collectionId_idx` ON `userCollectionCollaborators` (`collection_id`);--> statement-breakpoint
CREATE INDEX `userCollectionCollaborators_collaboratorId_idx` ON `userCollectionCollaborators` (`collaborator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `requestForm_id_unique` ON `requestForm` (`id`);--> statement-breakpoint
CREATE INDEX `request_form_user_id_idx` ON `requestForm` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `requestFormUpvotes_id_unique` ON `requestFormUpvotes` (`id`);--> statement-breakpoint
CREATE INDEX `request_form_upvotes_idx` ON `requestFormUpvotes` (`request_form_id`,`user_id`);