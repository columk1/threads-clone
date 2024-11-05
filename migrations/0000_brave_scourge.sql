CREATE TABLE `counter` (
	`id` integer PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	`updated_at` integer DEFAULT (cast(unixepoch() as int))
);
--> statement-breakpoint
CREATE TABLE `email_verification_code` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`user_id` text NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `followers` (
	`user_id` text NOT NULL,
	`follower_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	PRIMARY KEY(`user_id`, `follower_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_id` text,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
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
	`email_verified` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);