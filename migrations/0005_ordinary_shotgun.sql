PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`source_user_id` text,
	`post_id` text,
	`reply_id` text,
	`seen` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`source_user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`reply_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "notification_type_fields" CHECK(("__new_notifications"."type" = 'FOLLOW' AND "__new_notifications"."post_id" IS NULL AND "__new_notifications"."reply_id" IS NULL)
          OR ("__new_notifications"."type" IN ('LIKE', 'REPOST') AND "__new_notifications"."post_id" IS NOT NULL AND "__new_notifications"."reply_id" IS NULL)
          OR ("__new_notifications"."type" = 'REPLY' AND "__new_notifications"."post_id" IS NOT NULL AND "__new_notifications"."reply_id" IS NOT NULL))
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("id", "user_id", "type", "source_user_id", "post_id", "reply_id", "seen", "created_at") SELECT "id", "user_id", "type", "source_user_id", "post_id", "reply_id", "seen", "created_at" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `notif_user_seen_created_idx` ON `notifications` (`user_id`,`seen`,`created_at`) WHERE "notifications"."seen" = 0;