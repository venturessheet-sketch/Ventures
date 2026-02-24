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
      price: 6500, // $65.00
      category: "Unisex",
      imageUrl: "/images/FIT22_1771956770264.png",
      inStock: true
    });
    
    await storage.createProduct({
      name: "Essential Grey Zip-Up",
      description: "Premium grey zip-up hoodie. Comfortable and stylish for daily wear.",
      price: 5500, // $55.00
      category: "Men",
      imageUrl: "/images/fit_1771956770265.png",
      inStock: true
    });

    await storage.createProduct({
      name: "Urban Logo Tee",
      description: "Simple, clean block-lettering logo t-shirt in white.",
      price: 3500, // $35.00
      category: "Women",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
      inStock: true
    });

    await storage.createProduct({
      name: "Streetwear Cap",
      description: "Minimalist cap featuring our iconic house font logo.",
      price: 2500, // $25.00
      category: "Unisex",
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop",
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