import { useState, useEffect, useMemo } from "react";
import { fetchProducts } from "@/data/products";
import type { Product } from "@/data/products";

export function useProducts(category?: string) {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetchProducts()
      .then((products) => {
        if (mounted) {
          setData(products);
          setIsError(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        if (mounted) setIsError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!category || category === "All") return data;
    return data.filter((p) => p.category === category);
  }, [data, category]);

  return { data: filteredData, isLoading, isError };
}

export function useProduct(id: number) {
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetchProducts()
      .then((products) => {
        if (mounted) {
          const product = products.find((p) => p.id === id) ?? null;
          setData(product);
          setIsError(!product && !!id);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        if (mounted) setIsError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, isLoading, isError };
}

export type { Product };
