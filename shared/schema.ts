import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in cents
  category: text("category").notNull(), // 'Men', 'Women', 'Unisex'
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductResponse = Product;
export type ProductsListResponse = Product[];
