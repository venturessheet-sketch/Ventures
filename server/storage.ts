import { db } from "./db";
import { products, type InsertProduct, type ProductResponse, type ProductsListResponse } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  getProducts(category?: string): Promise<ProductsListResponse>;
  getProduct(id: number): Promise<ProductResponse | undefined>;
  createProduct(product: InsertProduct): Promise<ProductResponse>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(category?: string): Promise<ProductsListResponse> {
    if (category && category.toLowerCase() !== "all") {
      return await db.select().from(products).where(ilike(products.category, category));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<ProductResponse | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<ProductResponse> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
}

export const storage = new DatabaseStorage();