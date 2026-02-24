import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useProducts(category?: string) {
  return useQuery({
    queryKey: [api.products.list.path, category],
    queryFn: async () => {
      // Construct URL with query params manually for standard fetch
      const url = new URL(api.products.list.path, window.location.origin);
      if (category && category !== 'All') {
        url.searchParams.append('category', category);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      return api.products.list.responses[200].parse(data);
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      
      const data = await res.json();
      return api.products.get.responses[200].parse(data);
    },
    enabled: !!id && !isNaN(id),
  });
}
