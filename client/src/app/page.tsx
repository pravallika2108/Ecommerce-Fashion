"use client";

import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useState } from "react";

const gridItems = [
  {
    title: "WOMEN",
    subtitle: "From world's top designer",
    image:
      "https://images.unsplash.com/photo-1614251056216-f748f76cd228?q=80&w=1974&auto=format&fit=crop",
  },
  {
    title: "FALL LEGENDS",
    subtitle: "Timeless cool weather",
    image:
      "https://avon-demo.myshopify.com/cdn/shop/files/demo1-winter1_600x.png?v=1733380268",
  },
  {
    title: "ACCESSORIES",
    subtitle: "Everything you need",
    image:
      "https://avon-demo.myshopify.com/cdn/shop/files/demo1-winter4_600x.png?v=1733380275",
  },
  {
    title: "HOLIDAY SPARKLE EDIT",
    subtitle: "Party season ready",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1974&auto=format&fit=crop",
  },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const { banners, featuredProducts, fetchFeaturedProducts, fetchBanners } =
    useSettingsStore();

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
  }, [fetchBanners, fetchFeaturedProducts]);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (banners.length || 1));
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, [banners.length]);

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => ({ ...prev, [imageUrl]: true }));
  };

  console.log(banners, featuredProducts);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section className="relative h-[600px] overflow-hidden bg-gray-200">
        {banners.length === 0 ? (
          <div className="w-full h-full bg-gray-300 animate-pulse" />
        ) : (
          banners.map((bannerItem, index) => (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
              key={bannerItem.id}
            >
              <div className="absolute inset-0">
                {imageErrors[bannerItem.imageUrl] ? (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                ) : (
                  <img
                    src={bannerItem.imageUrl}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(bannerItem.imageUrl)}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20" />
              </div>
              <div className="relative h-full container mx-auto px-4 flex items-center">
                <div className="text-white space-y-6">
                  <span className="text-sm uppercase tracking-wider">
                    WELCOME TO SHOPVIBE
                  </span>
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    YOUR STYLE
                    <br />
                    YOUR VIBE
                  </h1>
                  <p className="text-lg">
                    Discover fashion and accessories that match your unique style.
                    <br />
                    Shop clothing, watches, sunglasses, and more.
                  </p>
                  <Button className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
                    SHOP NOW
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-semibold mb-2">
            THE WINTER EDIT
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Designed to keep your satisfaction and warmth
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gridItems.map((gridItem, index) => (
              <div key={index} className="relative group overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100">
                  {imageErrors[gridItem.image] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Image unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={gridItem.image}
                      alt={gridItem.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => handleImageError(gridItem.image)}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center text-white p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {gridItem.title}
                    </h3>
                    <p className="text-sm">{gridItem.subtitle}</p>
                    <Button className="mt-4 bg-white text-black hover:bg-gray-100">
                      SHOP NOW
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-semibold mb-2">
            NEW ARRIVALS
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Shop our new arrivals from established brands
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((productItem, index) => (
              <div key={index} className="relative group overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100">
                  {imageErrors[productItem.images[0]] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Image unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={productItem.images[0]}
                      alt={productItem.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => handleImageError(productItem.images[0])}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center text-white p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {productItem.name}
                    </h3>
                    <p className="text-sm">${productItem.price}</p>
                    <Button className="mt-4 bg-white text-black hover:bg-gray-100">
                      QUICK VIEW
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
