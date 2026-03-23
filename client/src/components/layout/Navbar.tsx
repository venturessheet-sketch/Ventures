import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getItemCount, setIsOpen } = useCartStore();

  const navLinks = [
    { name: "Shop All", path: "/shop" },
    { name: "Hoodies", path: "/shop?category=Hoodies" },
    { name: "Sweaters", path: "/shop?category=Sweaters" },
    { name: "T-Shirts", path: "/shop?category=T-Shirts" },
    { name: "Pants", path: "/shop?category=Regular Pants" },
    { name: "Shorts", path: "/shop?category=Shorts" },
    { name: "Ensemble", path: "/shop?category=Ensemble" },
  ];

  // Handle scroll for sticky border effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-40 bg-[#C0C0C0] transition-all duration-300",
          isScrolled ? "border-b-2 border-black brutalist-shadow-sm" : "border-b-2 border-transparent"
        )}
      >
        {/* Top Announcement Bar */}
        <div className="bg-black text-white py-1.5 overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee flex gap-8 text-xs font-display uppercase tracking-widest">
            <span>🔥 FREE SHIPPING NATIONWIDE IN MOROCCO 🔥</span>
            <span>HOUSE OF STREETWEAR</span>
            <span>🔥 NEW COLLECTION DROPPING SOON 🔥</span>
            <span>HOUSE OF STREETWEAR</span>
            <span>🔥 SHIPPING NATIONWIDE IN MOROCCO 🔥</span>
            <span>HOUSE OF STREETWEAR</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center z-50">
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tighter hover:scale-105 transition-transform origin-left">
              VENTURES<span className="text-red-600">.</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className={cn(
                  "font-display uppercase text-lg font-bold tracking-wide relative group overflow-hidden px-2 py-1",
                  location === link.path.split('?')[0] && !link.path.includes('?') 
                    ? "text-black" : "text-gray-500 hover:text-black transition-colors"
                )}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-black transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              </Link>
            ))}
          </nav>

          {/* Cart Trigger */}
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 hover-brutalist bg-[#C0C0C0] px-4 py-2 group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-lg hidden sm:block">CART</span>
            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 min-w-[24px] text-center">
              {getItemCount()}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-[#C0C0C0]"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-display font-black tracking-tighter">
                  VENTURES<span className="text-red-600">.</span>
                </h1>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 border-2 border-black brutalist-shadow hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col space-y-6 flex-1">
                <Link href="/" className="text-4xl font-display font-black uppercase hover:pl-4 transition-all hover:text-red-600">
                  Home
                </Link>
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.path}
                    className="text-4xl font-display font-black uppercase hover:pl-4 transition-all hover:text-red-600"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t-2 border-black pt-6 pb-8">
                <p className="font-sans text-sm text-gray-500 mb-2 uppercase tracking-widest">Connect</p>
                <div className="flex gap-4">
                  <a href="#" className="font-display font-bold text-xl hover:underline">INSTAGRAM</a>
                  <a href="#" className="font-display font-bold text-xl hover:underline">TIKTOK</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
