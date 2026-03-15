import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingItems = await storage.getProducts();
  if (existingItems.length === 0) {
    await storage.createProduct({
      name: "Classic Black Hoodie",
      description: "Our signature heavy-weight hoodie with a relaxed, modern fit.",
      price: 6500,
      category: "Hoodies",
      imageUrl: "/images/FIT22_1771956770264.png",
      inStock: true
    });
    
    await storage.createProduct({
      name: "Essential Grey Zip-Up",
      description: "Premium grey zip-up hoodie. Comfortable and stylish for daily wear.",
      price: 5500,
      category: "Hoodies",
      imageUrl: "/images/fit_1771956770265.png",
      inStock: true
    });

    await storage.createProduct({
      name: "Ventures Logo Tee",
      description: "Clean block-lettering logo t-shirt. Lightweight and breathable.",
      price: 3500,
      category: "T-Shirts",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
      inStock: true
    });

    await storage.createProduct({
      name: "Urban Crew Sweater",
      description: "Relaxed-fit crew neck sweater, perfect for layering.",
      price: 5800,
      category: "Sweaters",
      imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop",
      inStock: true
    });

    await storage.createProduct({
      name: "Street Regular Pants",
      description: "Straight cut pants with a clean silhouette. Everyday staple.",
      price: 6000,
      category: "Regular Pants",
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
      inStock: true
    });

    await storage.createProduct({
      name: "Oversized Baggy Pants",
      description: "Wide-leg baggy fit pants, the ultimate streetwear statement piece.",
      price: 7000,
      category: "Baggy Pants",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop",
      inStock: true
    });

    await storage.createProduct({
      name: "Essential Shorts",
      description: "Comfortable everyday shorts with a clean, minimal look.",
      price: 3800,
      category: "Shorts",
      imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&auto=format&fit=crop",
      inStock: true
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.products.list.path, async (req, res) => {
    try {
      const input = api.products.list.input?.parse(req.query);
      const items = await storage.getProducts(input?.category);
      res.json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  // Call seed async (will run when server starts)
  seedDatabase().catch(console.error);

  return httpServer;
}