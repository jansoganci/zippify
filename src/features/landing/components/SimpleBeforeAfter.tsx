import React, { useState } from 'react';

interface SimpleBeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export const SimpleBeforeAfter: React.FC<SimpleBeforeAfterProps> = ({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After"
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Before Image */}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg border border-border">
        <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-3 py-1 rounded-md font-bold">Before</div>
        <img 
          src={beforeImage} 
          alt={beforeAlt} 
          className="w-full h-full object-contain bg-muted/30"
        />
      </div>
      
      {/* After Image */}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg border border-border">
        <div className="absolute top-4 left-4 z-10 bg-primary/80 text-white px-3 py-1 rounded-md font-bold">After</div>
        <img 
          src={afterImage} 
          alt={afterAlt} 
          className="w-full h-full object-contain bg-primary/5"
        />
      </div>
    </div>
  );
};

// Alternative version with hover/click effect
export const HoverBeforeAfter: React.FC<SimpleBeforeAfterProps> = ({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After"
}) => {
  const [isShowingAfter, setIsShowingAfter] = useState(false);
  
  return (
    <div 
      className="relative w-full rounded-xl overflow-hidden shadow-lg border border-border cursor-pointer"
      onClick={() => setIsShowingAfter(!isShowingAfter)}
      onMouseEnter={() => setIsShowingAfter(true)}
      onMouseLeave={() => setIsShowingAfter(false)}
    >
      {/* Instruction */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 text-white px-4 py-2 rounded-md font-bold pointer-events-none transition-opacity duration-300"
           style={{ opacity: 0.8 }}>
        Click to see the difference
      </div>
      
      {/* Before Image (Base) */}
      <div className="w-full">
        <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-3 py-1 rounded-md font-bold">
          {isShowingAfter ? "After" : "Before"}
        </div>
        <img 
          src={isShowingAfter ? afterImage : beforeImage} 
          alt={isShowingAfter ? afterAlt : beforeAlt} 
          className="w-full h-full object-contain transition-all duration-300"
          style={{ 
            backgroundColor: isShowingAfter ? 'rgba(var(--primary), 0.05)' : 'rgba(0, 0, 0, 0.03)'
          }}
        />
      </div>
    </div>
  );
};

export default SimpleBeforeAfter;
