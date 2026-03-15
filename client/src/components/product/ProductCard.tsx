import { Link } from "wouter";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addItem(product);
    toast({
      title: "ADDED TO CART",
      description: `${product.name} is ready for checkout.`,
      className: "border-2 border-black brutalist-shadow bg-white rounded-none font-display uppercase",
    });
  };

  return (
    <Link 
      href={`/product/${product.id}`}
      className="group block hover-brutalist bg-[#C0C0C0] flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-100 border-b-2 border-black overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-black text-white font-display font-bold px-3 py-1 text-xs uppercase tracking-widest brutalist-shadow-sm">
            {product.category}
          </span>
        </div>
        
        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-white text-red-600 border-2 border-black font-display font-bold px-3 py-1 text-xs uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}

        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply"
        />
        
        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="absolute bottom-4 right-4 z-20 bg-[#C0C0C0] border-2 border-black p-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-[#C0C0C0] brutalist-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-xl uppercase tracking-wide leading-tight mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 flex justify-between items-end">
          <p className="font-display font-black text-2xl">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
