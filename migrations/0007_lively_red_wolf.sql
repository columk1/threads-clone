DROP INDEX `user_idx`;--> statement-breakpoint
DROP INDEX `parent_idx`;--> statement-breakpoint
CREATE INDEX `posts_user_idx` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_parent_idx` ON `posts` (`parent_id`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);--> statement-breakpoint
DROP INDEX `username_idx`;--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `followers_user_idx` ON `followers` (`user_id`);--> statement-breakpoint
CREATE INDEX `followers_follower_idx` ON `followers` (`follower_id`);--> statement-breakpoint
CREATE INDEX `likes_user_created_idx` ON `likes` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `likes_post_idx` ON `likes` (`post_id`);--> statement-breakpoint
CREATE INDEX `reposts_user_created_idx` ON `reposts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `reposts_post_idx` ON `reposts` (`post_id`);