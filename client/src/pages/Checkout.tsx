import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, ArrowLeft, Loader2, Ruler } from "lucide-react";


export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getTotal, clearCart } = useCartStore();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load saved info on mount
  useEffect(() => {
    const savedName = localStorage.getItem("checkout_name");
    const savedAddress = localStorage.getItem("checkout_address");
    const savedPhone = localStorage.getItem("checkout_phone");
    if (savedName) setFullName(savedName);
    if (savedAddress) setAddress(savedAddress);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  const total = getTotal();

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto border-4 border-black p-12 brutalist-shadow bg-[#C0C0C0]">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-display font-black uppercase mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 font-sans">You need to add some products before checking out.</p>
          <Button onClick={() => setLocation("/shop")} className="w-full h-14 text-xl font-display uppercase tracking-widest font-black">
            Go to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !phone) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save order to Google Sheets
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          address,
          phone,
          items: items.map(i => ({ 
            name: i.product.name, 
            quantity: i.quantity,
            price: i.product.price,
            size: i.size || "Unspecified"
          })),
          total: total
        })
      });

      if (!response.ok) throw new Error("Failed to save order");

      // 2. Prepare WhatsApp message
      const number = import.meta.env.VITE_WHATSAPP_NUMBER || "212600000000";
      let text = `*NEW ORDER FROM ${fullName.toUpperCase()}*\n`;
      text += ` Phone: ${phone}\n`;
      text += ` Address: ${address}\n\n`;
      text += "Order Details:\n";
      items.forEach(item => {
        text += `• ${item.quantity}x ${item.product.name} ${item.size ? `[Size: ${item.size}]` : `[NO SIZE SELECTED]`} - ${formatPrice(item.product.price * item.quantity)}\n`;
      });
      text += `\n*TOTAL: ${formatPrice(total)}*`;

      // 3. Save info for next time
      localStorage.setItem("checkout_name", fullName);
      localStorage.setItem("checkout_address", address);
      localStorage.setItem("checkout_phone", phone);

      // 4. Clear cart and Redirect
      clearCart();
      window.location.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      
      toast({ title: "Success!", description: "Your order has been recorded and you are being redirected to WhatsApp." });

    } catch (error) {
      toast({ title: "Error", description: "Failed to process order. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto pt-32 pb-20 px-4">
      <button 
        onClick={() => setLocation("/shop")}
        className="flex items-center gap-2 font-display font-bold uppercase tracking-widest hover:text-red-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <div className="bg-[#C0C0C0] border-4 border-black p-8 brutalist-shadow order-2 lg:order-1">
          <h2 className="text-3xl font-display font-black uppercase mb-8 border-b-4 border-black pb-4">Customer Information</h2>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-display uppercase font-bold tracking-widest text-gray-500">Full Name</Label>
              <Input 
                required 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="JOHN DOE" 
                className="h-14 border-2 border-black font-display font-bold brutalist-shadow-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-display uppercase font-bold tracking-widest text-gray-500">Phone Number</Label>
              <Input 
                required 
                type="tel"
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="06 12 34 56 78" 
                className="h-14 border-2 border-black font-display font-bold brutalist-shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-display uppercase font-bold tracking-widest text-gray-500">Full Address</Label>
              <Textarea 
                required 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="STREET NAME, APARTMENT NUMBER, CITY" 
                className="min-h-[120px] border-2 border-black font-display font-bold brutalist-shadow-xs"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 text-2xl font-display font-black uppercase tracking-widest bg-black text-white hover:bg-green-600 transition-colors relative overflow-hidden group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Processing...
                </>
              ) : (
                "Complete Order via WhatsApp"
              )}
            </Button>
            <p className="text-center text-xs text-gray-500 font-sans uppercase tracking-widest">
              By clicking, you will be redirected to WhatsApp to finalize your delivery.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-32">
            <h2 className="text-3xl font-display font-black uppercase mb-8 border-b-4 border-black pb-4">Order Summary</h2>
            <div className="bg-[#ADADAD] border-4 border-black p-6 brutalist-shadow-sm space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 items-center border-b-2 border-black pb-4 last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 bg-[#C0C0C0] border-2 border-black flex-shrink-0 overflow-hidden">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold uppercase leading-tight line-clamp-1">{item.product.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                      <span className="text-gray-700 font-sans text-sm">Qty: {item.quantity}</span>
                      {item.size ? (
                        <span className="text-[#C0C0C0] font-display text-xs font-bold tracking-widest bg-black px-1.5 border border-black uppercase">Size {item.size}</span>
                      ) : (
                        <span className="text-red-700 font-sans text-xs font-bold border border-red-700 px-1.5 uppercase tracking-wider bg-red-100">No Size!</span>
                      )}
                    </div>
                  </div>
                  <p className="font-display font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              
              <div className="bg-black text-white p-6 -mx-6 -mb-6 mt-6 flex justify-between items-center">
                <span className="font-display text-2xl uppercase tracking-widest">Total</span>
                <span className="font-display text-4xl font-black">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
