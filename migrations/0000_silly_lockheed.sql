CREATE TABLE `counter` (
	`id` integer PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch() as int)),
	`updated_at` integer DEFAULT (cast(unixepoch() as int))
);
