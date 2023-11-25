CREATE TABLE `authSession` (
	`id` text NOT NULL,
	`active_expires` integer NOT NULL,
	`idle_expires` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authSession_id_unique` ON `authSession` (`id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `authSession` (`user_id`);