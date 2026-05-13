import { Link } from "wouter";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);

  const imageUrls = product.imageUrls || [product.imageUrl];
  const hasMultipleImages = imageUrls.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "ADDED TO CART",
      description: `${product.name} is ready for checkout.`,
      className: "border-2 border-black brutalist-shadow bg-[#C0C0C0] rounded-none font-display uppercase",
    });
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block hover-brutalist bg-[#C0C0C0] flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-[#ADADAD] border-b-2 border-black overflow-hidden flex-shrink-0">
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-black text-[#C0C0C0] font-display font-bold px-3 py-1 text-xs uppercase tracking-widest brutalist-shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-[#C0C0C0] text-red-600 border-2 border-black font-display font-bold px-3 py-1 text-xs uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}

        {/* Image Stack with crossfade */}
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`${product.name}${imageUrls.length > 1 ? ` - ${index + 1}` : ''}`}
            className={`absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply transition-opacity duration-400 ease-in-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Slider Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-[#C0C0C0]/90 border-2 border-black p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black hover:text-[#C0C0C0]"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-[#C0C0C0]/90 border-2 border-black p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black hover:text-[#C0C0C0]"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-2 h-2 rounded-full border border-black transition-colors duration-200 ${
                    i === activeIndex ? "bg-black" : "bg-[#C0C0C0]/80 hover:bg-black/50"
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

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
          {!product.inStock && (
            <span className="text-xs font-display uppercase text-gray-500">Sold Out</span>
          )}
        </div>
      </div>
    </Link>
  );
}
