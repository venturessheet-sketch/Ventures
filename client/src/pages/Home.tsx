import { Link } from "wouter";
import { ArrowRight, Zap } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/ProductCard";
import { useEffect, useState } from "react";

const GIRL_IMAGES = [
  "/images/1.jpg",
  "/images/2.jpg",
];

const MAN_IMAGES = [
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/FIT22_1771956770264.png",
  "/images/fit_1771956770265.png",
];

const DEFAULT_HERO_MARQUEE = "VENTURES CLOTHING // MOROCCO // QUALITY STREETWEAR //";

export default function Home() {
  const { data: allProducts, isLoading } = useProducts();
  const [heroMarquee, setHeroMarquee] = useState(DEFAULT_HERO_MARQUEE);
  const [girlIndex, setGirlIndex] = useState(0);
  const [manIndex, setManIndex] = useState(0);

  // Auto-rotate hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setGirlIndex((prev) => (prev + 1) % GIRL_IMAGES.length);
      setManIndex((prev) => (prev + 1) % MAN_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextImage = () => {
    setGirlIndex((prev) => (prev + 1) % GIRL_IMAGES.length);
    setManIndex((prev) => (prev + 1) % MAN_IMAGES.length);
  };

  useEffect(() => {
    fetch("/api/site-settings")
      .then(r => r.json())
      .then(d => { if (d.heroMarquee) setHeroMarquee(d.heroMarquee); })
      .catch(() => {});
  }, []);

  // Get 4 featured products (visible only)
  const featuredProducts = allProducts?.filter(p => p.isVisible).slice(0, 4) || [];

  return (
    <div className="pt-20">
      {/* Brutalist Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col lg:flex-row border-b-4 border-black">
        {/* Left/Top Content */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 xl:p-24 relative z-10 bg-[#C0C0C0] border-b-4 lg:border-b-0 lg:border-r-4 border-black">
          <div className="inline-flex items-center gap-2 border-2 border-black px-4 py-2 w-max mb-8 brutalist-shadow-sm bg-[#FF7800]">
            <Zap className="w-5 h-5 fill-black" />
            <span className="font-display font-bold uppercase tracking-widest">Est. 2024 • Morocco</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85] mb-8">
            Define<br />
            Your<br />
            <span className="text-outline">Streets.</span>
          </h1>
          
          <p className="font-sans text-lg md:text-xl max-w-md mb-10 text-gray-700">
            Uncompromising urban fashion built for the modern youth. High-quality unisex pieces with a raw edge.
          </p>
          
          <Link href="/shop" className="hover-brutalist bg-black text-white w-max px-10 py-5 flex items-center gap-4 group">
            <span className="font-display text-2xl font-bold uppercase tracking-widest">Shop Now</span>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* Right/Bottom Image Grid */}
        <div 
          className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 relative overflow-hidden bg-[#C0C0C0] cursor-pointer group"
          onClick={handleNextImage}
        >
          <div className="relative border-b-4 md:border-b-0 md:border-r-4 lg:border-r-0 lg:border-b-4 xl:border-b-0 xl:border-r-4 border-black h-full min-h-[40vh] overflow-hidden bg-[#C0C0C0]">
            {GIRL_IMAGES.map((src, i) => (
              <img 
                key={`left-girl-${i}`} 
                src={src} 
                alt={`Streetwear model girl ${i+1}`} 
                className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-105 ${girlIndex === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
            ))}
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0 z-20"></div>
          </div>
          <div className="relative h-full min-h-[40vh] overflow-hidden bg-[#C0C0C0]">
            {MAN_IMAGES.map((src, i) => (
              <img 
                key={`right-man-${i}`} 
                src={src} 
                alt={`Streetwear model man ${i+1}`} 
                className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out group-hover:scale-105 ${manIndex === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
            ))}
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0 z-20"></div>
          </div>
          
          {/* Central overlap badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-24 h-24 sm:w-32 sm:h-32 bg-[#C0C0C0] border-4 border-black rounded-full flex items-center justify-center brutalist-shadow animate-[spin_10s_linear_infinite]">
            <div className="font-display font-black text-lg sm:text-xl text-center leading-none">
              NEW<br/>DROP
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b-4 border-black pb-6">
          <div>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase">Latest Drops</h2>
            <p className="font-sans text-gray-500 mt-2">Fresh arrivals for the season.</p>
          </div>
          <Link href="/shop" className="font-display font-bold text-xl uppercase tracking-widest border-2 border-black px-6 py-3 hover-brutalist">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-[#ADADAD] animate-pulse border-2 border-black"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-dashed border-gray-300">
            <h3 className="font-display text-3xl font-bold uppercase mb-4">No products yet</h3>
            <p className="font-sans text-gray-500">Our collection is dropping soon. Check back later.</p>
          </div>
        )}
      </section>

      {/* Banner Section */}
      <section className="border-y-4 border-black bg-[#FF7800] py-20 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          <h2 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter text-black px-8">
            {heroMarquee}
          </h2>
          <h2 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter text-outline px-8">
            {heroMarquee}
          </h2>
        </div>
      </section>
    </div>
  );
}
