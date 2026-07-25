import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  description: text("description").notNull(),
  image_urls: text("image_urls").notNull(), // JSON array of URL strings
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const generatedCopy = pgTable("generated_copy", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id),
  hook: text("hook").notNull(),
  caption: text("caption").notNull(),
  script_json: text("script_json").notNull(), // JSON array per-scene: [{ scene, text }]
  cta_text: text("cta_text").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  duration_seconds: integer("duration_seconds").notNull(),
  config_json: text("config_json").notNull(), // parameter template
  preview_url: text("preview_url").notNull(),
});

export const renders = pgTable("renders", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id),
  template_id: uuid("template_id")
    .notNull()
    .references(() => templates.id),
  status: text("status").notNull().default("queued"), // queued, processing, done, failed
  video_url: text("video_url"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at"),
});