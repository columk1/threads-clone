PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	`image` text,
	`image_width` integer,
	`image_height` integer,
	`user_id` text NOT NULL,
	`parent_id` text,
	`like_count` integer DEFAULT 0 NOT NULL,
	`reply_count` integer DEFAULT 0 NOT NULL,
	`repost_count` integer DEFAULT 0 NOT NULL,
	`share_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "text_or_image" CHECK(("__new_posts"."text" IS NOT NULL AND TRIM("__new_posts"."text") <> '') 
    OR ("__new_posts"."image" IS NOT NULL AND TRIM("__new_posts"."image") <> ''))
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "text", "image", "image_width", "image_height", "user_id", "parent_id", "like_count", "reply_count", "repost_count", "share_count", "created_at") SELECT "id", "text", "image", "image_width", "image_height", "user_id", "parent_id", "like_count", "reply_count", "repost_count", "share_count", "created_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `user_idx` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `posts` (`parent_id`);