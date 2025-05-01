import React, { useState } from 'react';

const HoverRevealImage = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Background decorative gradient */}
      <div className="absolute -z-10 w-full h-full rounded-2xl bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 blur-xl opacity-50 scale-110"></div>
      
      {/* Container with browser-like header */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 ease-in-out">
        {/* Browser header */}
        <div className="bg-gray-100 p-2 border-b border-gray-200">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        {/* Image container - Before and After */}
        <div className="relative">
          {/* Before Image (visible when not hovered) */}
          <div 
            className={`transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          >
            <img 
              src="/images/landing.dandik.jpg" 
              alt="Before optimization - Basic product listing"
              className="w-full h-auto"
            />
          </div>
          
          {/* After Image (visible when hovered) */}
          <div 
            className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src="/images/landing.iyi.jpg"
              alt="After optimization - Professional product listing" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      
      {/* Hover indicator text */}
      <div className={`mt-3 text-center text-sm text-gray-500 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`}>
        {isHovered ? 'Interactive preview activated' : 'Hover to see interactive preview'}
      </div>
    </div>
  );
};

export default HoverRevealImage;
