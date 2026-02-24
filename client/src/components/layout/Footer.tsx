import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-black mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="md:col-span-2">
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 text-outline opacity-50 hover:opacity-100 hover:text-white hover:-webkit-text-stroke-0 transition-all duration-300">
              VENTURES
            </h2>
            <p className="font-sans text-gray-400 max-w-sm mb-6">
              House of Streetwear. Bold, urban-style apparel designed for both men and women, targeting a young, modern audience in Morocco.
            </p>
            <div className="flex gap-4">
              <input 
                type="email" 
                placeholder="JOIN THE NEWSLETTER" 
                className="bg-transparent border-2 border-white px-4 py-3 font-display uppercase tracking-wider text-sm focus:outline-none focus:bg-white focus:text-black transition-colors w-full max-w-xs"
              />
              <button className="bg-white text-black font-display font-bold px-6 py-3 uppercase tracking-wider hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl tracking-widest uppercase mb-6 border-b-2 border-gray-800 pb-2 inline-block">Shop</h3>
            <ul className="space-y-4 font-sans text-gray-400">
              <li><Link href="/shop" className="hover:text-white transition-colors hover:pl-2">All Products</Link></li>
              <li><Link href="/shop?category=Men" className="hover:text-white transition-colors hover:pl-2">Men</Link></li>
              <li><Link href="/shop?category=Women" className="hover:text-white transition-colors hover:pl-2">Women</Link></li>
              <li><Link href="/shop?category=Unisex" className="hover:text-white transition-colors hover:pl-2">Unisex</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl tracking-widest uppercase mb-6 border-b-2 border-gray-800 pb-2 inline-block">Support</h3>
            <ul className="space-y-4 font-sans text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors hover:pl-2">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:pl-2">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:pl-2">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:pl-2">Contact Us</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Ventures Clothing. All rights reserved.
          </p>
          <div className="flex gap-6 font-sans text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
