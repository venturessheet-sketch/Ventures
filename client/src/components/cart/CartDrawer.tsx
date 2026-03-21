import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";

export function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

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
                    <div key={item.product.id} className="flex gap-4 p-4 bg-[#C0C0C0] border-2 border-black brutalist-shadow-sm">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-100 border-2 border-black flex-shrink-0 overflow-hidden">
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
                          </div>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border-2 border-black">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-display font-bold px-3 py-1 border-x-2 border-black min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
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
                <div className="flex justify-between items-center mb-6">
                  <span className="font-display text-xl uppercase tracking-wider text-gray-500">Subtotal</span>
                  <span className="font-display font-black text-3xl">{formatPrice(getTotal())}</span>
                </div>
                
                <p className="text-sm text-gray-500 font-sans mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                
                <button 
                  onClick={() => {
                    const number = import.meta.env.VITE_WHATSAPP_NUMBER || "212600000000";
                    let text = "Hello! I would like to place an order:\n\n";
                    items.forEach(item => {
                      text += `• ${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}\n`;
                    });
                    text += `\n*TOTAL: ${formatPrice(getTotal())}*`;
                    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="w-full hover-brutalist bg-black text-white py-5 font-display text-2xl uppercase tracking-widest relative overflow-hidden group">
                  <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">Checkout via WhatsApp</span>
                  <div className="absolute inset-0 h-full w-full bg-[#25D366] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300 ease-out z-0"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                    Send Order
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
