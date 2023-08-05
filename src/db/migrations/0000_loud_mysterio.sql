-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`game` varchar(191) NOT NULL,
	`asset_category` varchar(191) NOT NULL,
	`tags` enum('OFFICIAL','FANMADE') NOT NULL DEFAULT 'OFFICIAL',
	`url` varchar(191) NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`uploaded_by` varchar(191) NOT NULL,
	`uploaded_date` varchar(191) NOT NULL,
	`view_count` int NOT NULL DEFAULT 0,
	`download_count` int NOT NULL DEFAULT 0,
	`file_size` int NOT NULL,
	`width` int NOT NULL DEFAULT 0,
	`height` int NOT NULL DEFAULT 0,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authKey` (
	`id` varchar(191) NOT NULL,
	`hashed_password` varchar(191),
	`user_id` varchar(191) NOT NULL,
	CONSTRAINT `authKey_id` PRIMARY KEY(`id`),
	CONSTRAINT `authKey_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `authSession` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`active_expires` bigint NOT NULL,
	`idle_expires` bigint NOT NULL,
	CONSTRAINT `authSession_id` PRIMARY KEY(`id`),
	CONSTRAINT `authSession_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `authUser` (
	`id` varchar(191) NOT NULL,
	`avatar_url` varchar(191),
	`banner_url` varchar(191),
	`username` varchar(191) NOT NULL,
	`username_colour` varchar(191),
	`email` varchar(191) NOT NULL,
	`email_verified` int NOT NULL DEFAULT 0,
	`pronouns` varchar(191),
	`verified` int NOT NULL DEFAULT 0,
	`bio` varchar(191) DEFAULT '',
	`date_joined` datetime(3) NOT NULL,
	`role_flags` int NOT NULL DEFAULT 1,
	`self_assignable_role_flags` int,
	CONSTRAINT `authUser_id` PRIMARY KEY(`id`),
	CONSTRAINT `authUser_id_key` UNIQUE(`id`),
	CONSTRAINT `authUser_username_key` UNIQUE(`username`),
	CONSTRAINT `authUser_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `emailVerificationToken` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`expires` bigint NOT NULL,
	CONSTRAINT `emailVerificationToken_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailVerificationToken_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `follower` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	CONSTRAINT `follower_id` PRIMARY KEY(`id`),
	CONSTRAINT `follower_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `following` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	CONSTRAINT `following_id` PRIMARY KEY(`id`),
	CONSTRAINT `following_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`asset_count` int NOT NULL DEFAULT 0,
	`asset_categories` varchar(191) NOT NULL DEFAULT '',
	`last_updated` datetime(3) NOT NULL,
	`category_count` int NOT NULL DEFAULT 0,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`expires` bigint NOT NULL,
	CONSTRAINT `passwordResetToken_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetToken_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `pendingAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`game` varchar(191) NOT NULL,
	`asset_category` varchar(191) NOT NULL,
	`tags` enum('OFFICIAL','FANMADE') NOT NULL DEFAULT 'OFFICIAL',
	`url` varchar(191) NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`uploaded_by` varchar(191) NOT NULL,
	`uploaded_date` varchar(191) NOT NULL,
	`view_count` int NOT NULL DEFAULT 0,
	`download_count` int NOT NULL DEFAULT 0,
	`file_size` int NOT NULL,
	`width` int NOT NULL DEFAULT 0,
	`height` int NOT NULL DEFAULT 0,
	CONSTRAINT `pendingAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedOCGenerators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game` varchar(191) NOT NULL,
	`data` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`saved_date` datetime(3) NOT NULL,
	CONSTRAINT `savedOCGenerators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialsConnection` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`tiktok` varchar(191),
	`discord` varchar(191),
	CONSTRAINT `socialsConnection_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialsConnection_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE INDEX `assets_id_idx` ON `assets` (`id`);--> statement-breakpoint
CREATE INDEX `assets_name_idx` ON `assets` (`name`);--> statement-breakpoint
CREATE INDEX `assets_game_idx` ON `assets` (`game`);--> statement-breakpoint
CREATE INDEX `assets_status_idx` ON `assets` (`status`);--> statement-breakpoint
CREATE INDEX `assets_tags_idx` ON `assets` (`tags`);--> statement-breakpoint
CREATE INDEX `assets_uploaded_by_idx` ON `assets` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `authKey_user_id_idx` ON `authKey` (`user_id`);--> statement-breakpoint
CREATE INDEX `authSession_user_id_idx` ON `authSession` (`user_id`);--> statement-breakpoint
CREATE INDEX `emailVerificationToken_user_id_idx` ON `emailVerificationToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `follower_user_id_idx` ON `follower` (`user_id`);--> statement-breakpoint
CREATE INDEX `following_user_id_idx` ON `following` (`user_id`);--> statement-breakpoint
CREATE INDEX `games_id_idx` ON `games` (`id`);--> statement-breakpoint
CREATE INDEX `games_name_idx` ON `games` (`name`);--> statement-breakpoint
CREATE INDEX `passwordResetToken_user_id_idx` ON `passwordResetToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `pendingAssets_id_idx` ON `pendingAssets` (`id`);--> statement-breakpoint
CREATE INDEX `pendingAssets_name_idx` ON `pendingAssets` (`name`);--> statement-breakpoint
CREATE INDEX `pendingAssets_game_idx` ON `pendingAssets` (`game`);--> statement-breakpoint
CREATE INDEX `pendingAssets_status_idx` ON `pendingAssets` (`status`);--> statement-breakpoint
CREATE INDEX `pendingAssets_tags_idx` ON `pendingAssets` (`tags`);--> statement-breakpoint
CREATE INDEX `pendingAssets_uploaded_by_idx` ON `pendingAssets` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `savedOCGenerators_id_idx` ON `savedOCGenerators` (`id`);--> statement-breakpoint
CREATE INDEX `savedOCGenerators_game_idx` ON `savedOCGenerators` (`game`);--> statement-breakpoint
CREATE INDEX `savedOCGenerators_user_id_idx` ON `savedOCGenerators` (`user_id`);--> statement-breakpoint
CREATE INDEX `socialsConnection_user_id_idx` ON `socialsConnection` (`user_id`);
*/