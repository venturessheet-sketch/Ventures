import { useParams, Link } from "wouter";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id || "0");

  const { data: product, isError } = useProduct(productId);
  const { data: allProducts } = useProducts();
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);

  const relatedProducts = allProducts
    ?.filter((p) => p.id !== productId && p.category === product?.category)
    .slice(0, 4) || [];

  if (isError || !product) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="font-display text-6xl font-black uppercase mb-4">Item Not Found</h1>
        <p className="font-sans text-gray-600 mb-8">This piece might have been removed or doesn't exist.</p>
        <Link href="/shop" className="hover-brutalist bg-black text-[#C0C0C0] px-8 py-4 font-display text-xl uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="pt-20 pb-24">
      {/* Breadcrumb */}
      <div className="border-b-2 border-black bg-[#C0C0C0] sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4 text-sm font-display uppercase tracking-widest font-bold">
          <Link href="/shop" className="text-gray-600 hover:text-black flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Shop
          </Link>
          <span className="text-gray-400">/</span>
          <Link href={`/shop?category=${product.category}`} className="text-gray-600 hover:text-black">
            {product.category}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-black truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

          {/* Left: Image */}
          <div className="flex-1">
            <div className="border-4 border-black brutalist-shadow bg-[#ADADAD] aspect-[4/5] relative overflow-hidden group">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center mix-blend-multiply transition-transform duration-700 hover:scale-105 cursor-zoom-in"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-red-600 text-[#C0C0C0] font-display font-black text-5xl uppercase tracking-tighter px-8 py-4 border-4 border-black rotate-[-12deg]">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col pt-4">
            <div className="inline-block border-2 border-black px-4 py-1 w-max mb-6 font-display font-bold uppercase tracking-widest text-sm bg-black text-[#C0C0C0]">
              {product.category}
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none mb-6">
              {product.name}
            </h1>

            <p className="text-4xl font-display font-black mb-8 border-b-4 border-black pb-8">
              {formatPrice(product.price)}
            </p>

            <div className="prose prose-lg font-sans text-gray-700 mb-12">
              <p>{product.description}</p>
            </div>

            {/* Action Area */}
            <div className="mt-auto bg-[#ADADAD] border-4 border-black p-6 brutalist-shadow">
              {product.inStock ? (
                <div className="space-y-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold uppercase tracking-widest text-lg">Quantity</span>
                    <div className="flex items-center border-2 border-black bg-[#C0C0C0]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-black hover:text-[#C0C0C0] transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-display font-bold text-xl px-6 border-x-2 border-black min-w-[4rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-black hover:text-[#C0C0C0] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full hover-brutalist bg-black text-[#C0C0C0] py-6 font-display text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6" strokeWidth={3} />
                      Add to Cart
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-[#FF7800] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300 ease-out z-0"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-black z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6" strokeWidth={3} />
                      Add to Cart
                    </span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#C0C0C0] border-2 border-gray-500 p-6 text-center">
                  <p className="font-display text-2xl font-black uppercase text-gray-600">Out of Stock</p>
                  <p className="font-sans text-sm text-gray-600 mt-2">Restock coming soon. Follow our socials for updates.</p>
                </div>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="border-2 border-black p-4 flex items-start gap-3 bg-[#ADADAD]">
                <Truck className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-display font-bold uppercase">Free Shipping</h4>
                  <p className="font-sans text-sm text-gray-600">Nationwide in Morocco</p>
                </div>
              </div>
              <div className="border-2 border-black p-4 flex items-start gap-3 bg-[#ADADAD]">
                <RotateCcw className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-display font-bold uppercase">14-Day Returns</h4>
                  <p className="font-sans text-sm text-gray-600">No questions asked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t-4 border-black mt-12">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase mb-12 text-center">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
