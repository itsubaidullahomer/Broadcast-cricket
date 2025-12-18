import React from 'react';
import { Ball, BallType } from '../types';

interface BallCircleProps {
  ball: Ball;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BallCircle: React.FC<BallCircleProps> = ({ ball, size = 'md', className = '' }) => {
  let bgColor = 'bg-gray-700'; // Default DOT
  let textColor = 'text-white';
  let borderColor = 'border-gray-600';

  switch (ball.type) {
    case BallType.FOUR:
      bgColor = 'bg-blue-600';
      borderColor = 'border-blue-400';
      break;
    case BallType.SIX:
      bgColor = 'bg-purple-600';
      borderColor = 'border-purple-400';
      break;
    case BallType.WICKET:
      bgColor = 'bg-red-600';
      borderColor = 'border-red-400';
      break;
    case BallType.WIDE:
    case BallType.NO_BALL:
      bgColor = 'bg-orange-600';
      borderColor = 'border-orange-400';
      break;
    case BallType.RUN:
      if (ball.runs > 0) {
        bgColor = 'bg-gray-600';
        borderColor = 'border-gray-500';
      }
      break;
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs border',
    md: 'w-9 h-9 text-sm border-2',
    lg: 'w-12 h-12 text-lg border-2 font-bold',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tabular-nums shadow-lg ${sizeClasses[size]} ${bgColor} ${textColor} ${borderColor} ${className}`}
    >
      {ball.value}
    </div>
  );
};

export default BallCircle;