import React, { useState, useEffect } from 'react';

interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

const BannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners: Banner[] = [
    {
      id: 1,
      image: "/images/59da67679812155c.webp",
      title: "",
      subtitle: "",
      link: "/electronics"
    },
    {
      id: 2,
      image: "/images/5b309e98775e22e4.webp",
      title: "",
      subtitle: "",
      link: "/fashion"
    },
    {
      id: 3,
      image: "/images/8b6ca008fd2f7d2b.webp",
      title: "",
      subtitle: "",
      link: "/mobiles"
    },
    {
      id: 4,
      image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1440&h=400",
      title: "Home & Furniture Sale",
      subtitle: "Transform your space with great deals",
      link: "/home-furniture"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleBannerClick = (link: string) => {
    console.log(`Navigating to: ${link}`);
    // In a real app, you would use router navigation here
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg mb-6">
      {/* Banner Images */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full h-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleBannerClick(banner.link)}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-sm md:text-lg lg:text-xl drop-shadow-lg">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-white scale-110'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => goToSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => goToSlide((currentSlide + 1) % banners.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default BannerCarousel;