import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-[#C0C0C0] border-t-4 border-black mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="md:col-span-2">
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 text-outline opacity-50 hover:opacity-100 hover:text-[#C0C0C0] transition-all duration-300">
              VENTURES
            </h2>
            <p className="font-sans text-gray-400 max-w-sm mb-6">
              House of Streetwear. Bold, urban-style apparel for the modern generation. Proudly made for Morocco.
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="JOIN THE NEWSLETTER"
                className="bg-transparent border-2 border-[#C0C0C0] px-4 py-3 font-display uppercase tracking-wider text-sm focus:outline-none focus:bg-[#C0C0C0] focus:text-black transition-colors w-full max-w-xs"
              />
              <button className="bg-[#FF7800] text-black font-display font-bold px-6 py-3 uppercase tracking-wider border-2 border-[#FF7800] hover:bg-[#e86c00] transition-colors">
                Join
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl tracking-widest uppercase mb-6 border-b-2 border-gray-800 pb-2 inline-block">Shop</h3>
            <ul className="space-y-4 font-sans text-gray-400">
              <li><Link href="/shop" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">All Products</Link></li>
              <li><Link href="/shop?category=Hoodies" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Hoodies</Link></li>
              <li><Link href="/shop?category=Sweaters" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Sweaters</Link></li>
              <li><Link href="/shop?category=T-Shirts" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">T-Shirts</Link></li>
              <li><Link href="/shop?category=Regular Pants" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Regular Pants</Link></li>
              <li><Link href="/shop?category=Baggy Pants" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Baggy Pants</Link></li>
              <li><Link href="/shop?category=Shorts" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Shorts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl tracking-widest uppercase mb-6 border-b-2 border-gray-800 pb-2 inline-block">Support</h3>
            <ul className="space-y-4 font-sans text-gray-400">
              <li><a href="#" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">FAQ</a></li>
              <li><a href="#" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Size Guide</a></li>
              <li><a href="#" className="hover:text-[#C0C0C0] transition-colors hover:pl-2">Contact Us</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Ventures Clothing. All rights reserved.
          </p>
          <div className="flex gap-6 font-sans text-sm text-gray-500">
            <a href="#" className="hover:text-[#C0C0C0] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#C0C0C0] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
