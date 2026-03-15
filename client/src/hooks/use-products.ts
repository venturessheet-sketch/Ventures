import { useMemo } from "react";
import { products } from "@/data/products";
import type { Product } from "@/data/products";

export function useProducts(category?: string) {
  const data = useMemo(() => {
    if (!category || category === "All") return products;
    return products.filter((p) => p.category === category);
  }, [category]);

  return { data, isLoading: false, isError: false };
}

export function useProduct(id: number) {
  const product = products.find((p) => p.id === id) ?? null;
  return { data: product, isLoading: false, isError: !product && !!id };
}

export type { Product };
