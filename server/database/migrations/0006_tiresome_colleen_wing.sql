CREATE TABLE `order_ingredient_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_ingredient_checks_order_item_unique` ON `order_ingredient_checks` (`order_id`,`name`,`unit`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dishes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'IDEA' NOT NULL,
	`cooking_minutes` integer,
	`difficulty` text DEFAULT 'EASY' NOT NULL,
	`created_by` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_dishes`("id", "name", "description", "image_url", "status", "cooking_minutes", "difficulty", "created_by", "created_at", "updated_at") SELECT "id", "name", "description", "image_url", "status", "cooking_minutes", "difficulty", "created_by", "created_at", "updated_at" FROM `dishes`;--> statement-breakpoint
DROP TABLE `dishes`;--> statement-breakpoint
ALTER TABLE `__new_dishes` RENAME TO `dishes`;--> statement-breakpoint
UPDATE `dishes` SET `status` = 'IDEA' WHERE `status` = 'DRAFT';--> statement-breakpoint
PRAGMA foreign_keys=ON;
