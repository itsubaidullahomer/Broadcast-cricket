import React from 'react';

interface ShotMapProps {
  angle?: number; // 0 is Straight (North), 90 is East, 180 is South (Keeper), 270 is West
  className?: string;
  shotType?: string;
}

const ShotMap: React.FC<ShotMapProps> = ({ angle, className = '', shotType }) => {
  if (angle === undefined) return null;

  // Convert 0-360 compass angle to CSS rotation
  // Assuming 0 is UP (Straight Drive).
  const rotation = angle;

  return (
    <div className={`relative w-24 h-24 bg-green-900/30 rounded-full border-2 border-green-800 flex items-center justify-center ${className}`}>
      {/* The Pitch */}
      <div className="w-1.5 h-8 bg-[#e4d5b7] rounded-sm absolute opacity-60"></div>
      
      {/* The Wickets */}
      <div className="w-1 h-1 bg-white rounded-full absolute mb-9"></div>
      <div className="w-1 h-1 bg-white rounded-full absolute mt-9"></div>
      
      {/* 30 Yard Circle (Approx) */}
      <div className="absolute inset-4 border border-green-700/50 rounded-full border-dashed"></div>

      {/* The Shot Line */}
      <div 
        className="absolute w-1 h-1/2 origin-bottom transition-transform duration-1000 ease-out"
        style={{ 
            transform: `rotate(${rotation}deg)`,
            bottom: '50%'
        }}
      >
        <div className="w-full h-full relative">
            {/* The line trace */}
            <div className="absolute bottom-0 left-0 right-0 top-2 bg-gradient-to-t from-yellow-400 to-transparent opacity-80 rounded-full"></div>
            {/* The ball at the end */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>
      
      {/* Label for context (optional) */}
      <div className="absolute -bottom-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">
        {shotType || 'Shot Map'}
      </div>
    </div>
  );
};

export default ShotMap;