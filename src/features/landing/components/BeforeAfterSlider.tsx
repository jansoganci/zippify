import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number; // 0 to 100
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeContent,
  afterContent,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initialPosition = 50,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse/touch events for slider
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePositionFromEvent(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromEvent = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Get x position based on mouse or touch
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    } else {
      return;
    }
    
    const relativeX = clientX - containerRect.left;
    const newPosition = Math.max(0, Math.min(100, (relativeX / containerWidth) * 100));
    
    setPosition(newPosition);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    updatePositionFromEvent(e);
  };

  // Add and remove event listeners
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      window.addEventListener('touchend', handleMouseUpGlobal);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg shadow-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={(e) => updatePositionFromEvent(e)}
    >
      {/* Before content (full width) */}
      <div className="absolute inset-0 z-10">
        {beforeContent}
        <div className="absolute top-6 left-6 bg-black/70 text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg transition-opacity duration-300"
             style={{ opacity: isHovering || isDragging ? 1 : 0.7 }}>
          {beforeLabel}
        </div>
      </div>

      {/* After content (clipped based on slider position) */}
      <div 
        className="absolute inset-0 z-20 overflow-hidden border-r-4 border-white"
        style={{ width: `${position}%` }}
      >
        {afterContent}
        <div className="absolute top-6 left-6 bg-primary/80 text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg transition-opacity duration-300"
             style={{ opacity: isHovering || isDragging ? 1 : 0.7 }}>
          {afterLabel}
        </div>
      </div>

      {/* Slider handle */}
      <div 
        className="absolute top-0 bottom-0 z-30 w-4 bg-white shadow-xl cursor-ew-resize transition-all duration-200 hover:bg-primary/90 hover:w-6"
        style={{ 
          left: `${position}%`,
          transform: 'translateX(-50%)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-primary/50 transition-all duration-200"
             style={{ 
               transform: `translate(-50%, -50%) scale(${isHovering || isDragging ? 1.1 : 1})`,
             }}>
          <div className="w-1 h-10 bg-primary/80 rounded-full mx-0.5"></div>
          <div className="w-1 h-10 bg-primary/80 rounded-full mx-0.5"></div>
        </div>
      </div>

      {/* Hint overlay - only shows briefly */}
      <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center pointer-events-none transition-opacity duration-500"
           style={{ opacity: isHovering || isDragging ? 0 : 0 }}>
        <div className="text-white text-xl font-bold">Drag to compare</div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
