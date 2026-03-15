import { useLocation, useSearch } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

export default function Shop() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get("category");
  
  const currentCategory = categoryParam || "All";
  const { data: products, isLoading } = useProducts(currentCategory);
  const [location, setLocation] = useLocation();

  const categories = ["All", "Hoodies", "Sweaters", "T-Shirts", "Regular Pants", "Baggy Pants", "Shorts"];

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      setLocation("/shop");
    } else {
      setLocation(`/shop?category=${category}`);
    }
  };

  return (
    <div className="pt-20 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-black text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase">
            {currentCategory === "All" ? "Collection" : currentCategory}
          </h1>
          <p className="font-sans text-gray-400 mt-4 max-w-xl text-lg">
            Browse our full range of raw, urban-inspired pieces. Designed for comfort, built for the streets.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 border-2 border-black p-6 brutalist-shadow-sm bg-[#C0C0C0]">
            <h3 className="font-display font-bold text-2xl uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Categories</h3>
            <div className="flex flex-col space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "text-left font-display text-xl uppercase tracking-wider transition-all duration-200 py-1 border-l-4 px-3",
                    currentCategory === cat 
                      ? "border-black font-black" 
                      : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {/* Result Count */}
          <div className="mb-8 flex justify-between items-center border-b-2 border-gray-200 pb-4">
            <span className="font-display uppercase tracking-widest font-bold text-gray-500">
              {isLoading ? "Loading..." : `${products?.length || 0} Products`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse border-2 border-gray-200"></div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-300 p-16 text-center">
              <h2 className="font-display text-4xl font-black uppercase mb-4">Nothing Found</h2>
              <p className="font-sans text-gray-500 mb-8">
                We couldn't find any products in the "{currentCategory}" category right now.
              </p>
              <button 
                onClick={() => handleCategoryChange("All")}
                className="hover-brutalist bg-black text-white px-8 py-3 font-display font-bold uppercase tracking-widest"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
