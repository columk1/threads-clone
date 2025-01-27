CREATE TABLE `email_verification_code` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `followers` (
	`user_id` text NOT NULL,
	`follower_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	PRIMARY KEY(`user_id`, `follower_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "no_self_follow" CHECK("followers"."user_id" != "followers"."follower_id")
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
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
	FOREIGN KEY (`parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "text_or_image" CHECK(("posts"."text" IS NOT NULL AND TRIM("posts"."text") <> '') 
    OR ("posts"."image" IS NOT NULL AND TRIM("posts"."image") <> ''))
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `posts` (`parent_id`);--> statement-breakpoint
CREATE TABLE `reposts` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`email_verified` integer NOT NULL,
	`avatar` text,
	`bio` text,
	`follower_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);