import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, updateSize, getTotal, clearCart } = useCartStore();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#C0C0C0] border-l-4 border-black brutalist-shadow flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#C0C0C0]">
              <h2 className="text-3xl font-display font-black tracking-tighter uppercase flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" strokeWidth={2.5} />
                Your Cart
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 border-2 border-black brutalist-shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#ADADAD]">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center bg-[#C0C0C0] brutalist-shadow">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold uppercase mb-2">Cart is empty</h3>
                    <p className="text-gray-500 font-sans">Looks like you haven't added anything yet.</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="hover-brutalist bg-black text-white px-8 py-4 font-display text-xl uppercase tracking-wider"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 p-4 bg-[#C0C0C0] border-2 border-black brutalist-shadow-sm">
                      {/* Image */}
                      <div className="w-24 h-24 bg-[#ADADAD] border-2 border-black flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover object-center mix-blend-multiply"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-display font-bold uppercase text-lg leading-tight line-clamp-2">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500 font-sans mt-1">{item.product.category}</p>
                            <div className="mt-2">
                              <select
                                value={item.size || ""}
                                onChange={(e) => updateSize(item.cartItemId, e.target.value)}
                                className={`font-display text-xs font-bold uppercase tracking-widest px-2 py-1 outline-none cursor-pointer border ${item.size ? 'bg-black text-[#C0C0C0] border-black' : 'bg-red-200 text-red-800 border-red-800 animate-pulse'}`}
                              >
                                <option value="" disabled>CHOOSE SIZE</option>
                                <option value="S">SIZE: S</option>
                                <option value="M">SIZE: M</option>
                                <option value="L">SIZE: L</option>
                                <option value="XL">SIZE: XL</option>
                              </select>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.cartItemId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border-2 border-black">
                            <button 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-[#ADADAD] transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-display font-bold px-3 py-1 border-x-2 border-black min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-[#ADADAD] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-display font-bold text-lg">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t-4 border-black p-6 bg-[#C0C0C0]">
              {/* Free Shipping Banner */}
              {items.reduce((sum, i) => sum + i.quantity, 0) >= 2 && (
                <div className="flex items-center gap-2 bg-black text-white px-4 py-2.5 mb-4 border-2 border-black">
                  <span className="text-base"></span>
                  <span className="font-display font-bold uppercase tracking-widest text-sm">Free Shipping Unlocked!</span>
                </div>
              )}

                <div className="flex justify-between items-center mb-6">
                  <span className="font-display text-xl uppercase tracking-wider text-gray-500">Subtotal</span>
                  <span className="font-display font-black text-3xl">{formatPrice(getTotal())}</span>
                </div>
                
                <p className="text-sm text-gray-500 font-sans mb-6 italic">
                  Complete your details on the next page.
                </p>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full hover-brutalist bg-black text-white py-5 font-display text-2xl uppercase tracking-widest relative overflow-hidden group">
                  <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">
                    Proceed to Checkout
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-red-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300 ease-out z-0"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                    Checkout Now
                  </span>
                </button>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={clearCart}
                    className="text-sm font-sans text-gray-400 hover:text-black underline underline-offset-4"
                  >
                    Empty Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
