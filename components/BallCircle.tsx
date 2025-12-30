import React from 'react';
import { Ball, BallType } from '../types';

interface BallCircleProps {
  ball: Ball;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BallCircle: React.FC<BallCircleProps> = ({ ball, size = 'md', className = '' }) => {
  let bgClass = 'bg-gray-700'; 
  let textClass = 'text-white';
  let borderClass = 'border-gray-600';

  // Define gradients/colors for 3D effect
  switch (ball.type) {
    case BallType.FOUR:
      bgClass = 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
      borderClass = 'border-blue-400';
      break;
    case BallType.SIX:
      bgClass = 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      borderClass = 'border-purple-400';
      break;
    case BallType.WICKET:
      bgClass = 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      borderClass = 'border-red-400';
      break;
    case BallType.WIDE:
    case BallType.NO_BALL:
      bgClass = 'bg-gradient-to-br from-orange-400 to-orange-600';
      borderClass = 'border-orange-300';
      textClass = 'text-white';
      break;
    case BallType.RUN:
      if (ball.runs > 0) {
        bgClass = 'bg-gradient-to-br from-gray-500 to-gray-700';
        borderClass = 'border-gray-400';
      } else {
        // Dot ball
        bgClass = 'bg-gradient-to-br from-gray-700 to-gray-800';
        borderClass = 'border-gray-600';
        textClass = 'text-gray-400';
      }
      break;
    case BallType.DOT:
    default:
        bgClass = 'bg-gradient-to-br from-gray-700 to-gray-800';
        borderClass = 'border-gray-600';
        textClass = 'text-gray-400';
      break;
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs border-[1px]',
    md: 'w-10 h-10 text-lg border-2',
    lg: 'w-14 h-14 text-2xl border-2 font-bold',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-teko font-bold tabular-nums shadow-lg ${sizeClasses[size]} ${bgClass} ${textClass} ${borderClass} ${className} relative overflow-hidden`}
    >
      {/* Gloss Effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full pointer-events-none"></div>
      
      <span className="relative z-10 mt-[2px]">{ball.value}</span>
    </div>
  );
};

export default BallCircle;