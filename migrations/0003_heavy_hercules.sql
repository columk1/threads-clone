CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

ALTER TABLE `posts` ADD `like_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);