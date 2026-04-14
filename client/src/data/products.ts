export interface Product {
  id: number;
  name: string;
  description: string;
  details?: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  quantity: number;
  isVisible: boolean;
}

import Papa from "papaparse";

export interface Product {
  id: number;
  name: string;
  description: string;
  details?: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  quantity: number;
  isVisible: boolean;
}

// Hardcoded fallback data in case the Google Sheet is missing or fails to load.
const fallbackProducts: Product[] = [
  { id: 1, name: "Classic Black Hoodie", description: "Our signature heavy-weight hoodie with a relaxed, modern fit. Crafted from premium cotton-fleece for all-day comfort.", price: 65, category: "Hoodies", imageUrl: "/images/FIT22_1771956770264.png", inStock: true, quantity: 10, isVisible: true },
  { id: 2, name: "Essential Grey Zip-Up", description: "Premium grey zip-up hoodie. Comfortable and stylish for daily wear. Oversized fit with a clean silhouette.", price: 55, category: "Hoodies", imageUrl: "/images/fit_1771956770265.png", inStock: true, quantity: 10, isVisible: true },
  { id: 3, name: "Ventures Logo Tee", description: "Clean block-lettering logo t-shirt. Lightweight and breathable, made for everyday wear.", price: 35, category: "T-Shirts", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 4, name: "Urban Graphic Tee", description: "Bold graphic print on a relaxed-fit tee. Express your street identity.", price: 38, category: "T-Shirts", imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 5, name: "Urban Crew Sweater", description: "Relaxed-fit crew neck sweater, perfect for layering. Heavyweight feel with a soft interior.", price: 58, category: "Sweaters", imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 6, name: "Minimal Knit Sweater", description: "Slim minimal knit with a clean cut. Versatile piece that pairs with everything.", price: 52, category: "Sweaters", imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 7, name: "Street Regular Pants", description: "Straight cut pants with a clean silhouette. An everyday staple that works from street to studio.", price: 60, category: "Regular Pants", imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 8, name: "Oversized Baggy Pants", description: "Wide-leg baggy fit pants — the ultimate streetwear statement piece. Dropped crotch and relaxed through the thigh.", price: 70, category: "Baggy Pants", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 9, name: "Cargo Baggy Pants", description: "Functional multi-pocket baggy pants. Utility meets street style.", price: 75, category: "Baggy Pants", imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop", inStock: false, quantity: 0, isVisible: true },
  { id: 10, name: "Essential Shorts", description: "Comfortable everyday shorts with a clean, minimal look. Mid-thigh length with an elastic waistband.", price: 38, category: "Shorts", imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
  { id: 11, name: "Urban Sport Shorts", description: "Lightweight sport shorts built for movement and style. Perfect for summer drops.", price: 35, category: "Shorts", imageUrl: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&auto=format&fit=crop", inStock: true, quantity: 10, isVisible: true },
];

// This is where you would put the Google Sheets published CSV URL
const GOOGLE_SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || "";

// In-memory cache to prevent multiple sheet fetches
let productsCache: Product[] | null = null;
let fetchPromise: Promise<Product[]> | null = null;

export async function fetchProducts(): Promise<Product[]> {
  if (productsCache) return productsCache;
  if (fetchPromise) return fetchPromise;

  if (!GOOGLE_SHEET_CSV_URL) {
    console.warn("No VITE_GOOGLE_SHEET_CSV_URL provided. Falling back to hardcoded products.");
    productsCache = fallbackProducts;
    return fallbackProducts;
  }

  fetchPromise = new Promise((resolve, reject) => {
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedProducts: Product[] = results.data.map((row: any, index: number) => ({
            id: row.id ? parseInt(row.id, 10) : index + 1,
            name: row.name || "Unknown Product",
            description: row.description || "",
            details: row.details || "",
            price: row.price ? parseFloat(row.price) : 0,
            category: row.category || "Uncategorized",
            imageUrl: row.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
            inStock: row.inStock === "true" || row.inStock === "TRUE" || row.inStock === true,
            quantity: row.quantity ? parseInt(row.quantity, 10) : 0,
            isVisible: row.isVisible === undefined || row.isVisible === "" || row.isVisible === "true" || row.isVisible === "TRUE" || row.isVisible === true
          }));
          
          productsCache = parsedProducts;
          resolve(parsedProducts);
        } catch (error) {
          console.error("Failed to parse products from CSV", error);
          resolve(fallbackProducts);
        }
      },
      error: (error) => {
        console.error("Failed to fetch Google Sheets CSV", error);
        resolve(fallbackProducts); // fallback on error
      }
    });
  });

  return fetchPromise;
}

// For backwards compatibility with the current synchronous codebase where possible.
// Components should ideally migrate to using `fetchProducts` asynchronous function,
// but we leave this here to avoid immediately breaking synchronous imports.
export const products: Product[] = fallbackProducts;
