import React from 'react';
import { Bowler, Ball } from '../types';
import BallCircle from './BallCircle';

interface BowlerCardProps {
  bowler: Bowler;
  currentOver: Ball[];
}

const BowlerCard: React.FC<BowlerCardProps> = ({ bowler, currentOver }) => {
  const economy = (bowler.runsConceded / bowler.overs).toFixed(2);

  return (
    <div className="bg-gradient-to-l from-slate-800 to-slate-900 p-4 border-r-4 border-blue-500 h-full flex flex-col justify-between">
      
      {/* Top Row: Name and Main Stats */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl broadcast-font font-bold text-white tracking-wide uppercase">
            {bowler.name}
          </h3>
          <div className="flex gap-4 text-sm text-gray-400 mt-1 font-medium">
             <span>{Math.floor(bowler.overs)}.{Math.round((bowler.overs % 1) * 10)} overs</span>
             <span className="w-1 h-1 bg-gray-600 rounded-full self-center"></span>
             <span>{bowler.maidens} M</span>
             <span className="w-1 h-1 bg-gray-600 rounded-full self-center"></span>
             <span>ECO <span className="text-white tabular-nums">{economy}</span></span>
          </div>
        </div>
        
        <div className="text-right">
            <div className="text-4xl broadcast-font font-bold text-white tabular-nums leading-none">
              {bowler.wickets}<span className="text-gray-500 mx-1">-</span>{bowler.runsConceded}
            </div>
        </div>
      </div>

      {/* Bottom Row: Current Over Timeline */}
      <div className="bg-black/30 rounded-lg p-2 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">This Over</span>
        <div className="flex gap-2">
          {currentOver.map((ball) => (
            <BallCircle key={ball.id} ball={ball} size="sm" />
          ))}
          {/* Placeholders for remaining balls to maintain spacing consistency if needed, 
              but usually dynamic is better. Let's keep it dynamic. */}
        </div>
      </div>

    </div>
  );
};

export default BowlerCard;