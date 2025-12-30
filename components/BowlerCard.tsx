import React from 'react';
import { Bowler, Ball, BallType } from '../types';
import BallCircle from './BallCircle';

interface BowlerCardProps {
  bowler: Bowler;
  currentOver: Ball[];
}

const BowlerCard: React.FC<BowlerCardProps> = ({ bowler, currentOver }) => {
  const eco = bowler.overs > 0 ? (bowler.runsConceded / bowler.overs).toFixed(2) : '0.00';

  return (
    <div className="w-full h-full flex flex-col relative font-roboto">
      
      {/* Background styling for container */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#13171f] to-[#0e1219] rounded-lg border border-gray-800/50 shadow-inner"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-5">
        
        {/* Header: Name and Image Area */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col z-20">
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Current Bowler</div>
                <div className="text-[36px] font-teko font-bold text-white uppercase leading-[0.9] tracking-wide drop-shadow-lg">{bowler.name}</div>
                <div className="flex items-center gap-3 mt-2">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Overs</span>
                        <span className="text-xl font-teko font-bold text-white leading-none">{bowler.overs}</span>
                     </div>
                     <div className="w-px h-6 bg-gray-700"></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Maiden</span>
                        <span className="text-xl font-teko font-bold text-white leading-none">{bowler.maidens}</span>
                     </div>
                     <div className="w-px h-6 bg-gray-700"></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Economy</span>
                        <span className="text-xl font-teko font-bold text-gray-300 leading-none">{eco}</span>
                     </div>
                </div>
            </div>

            {/* Main Bowler Stats */}
            <div className="flex items-end gap-1 z-20 bg-black/20 px-3 py-1 rounded backdrop-blur-sm border border-white/5">
                <div className="flex flex-col items-end">
                    <span className="text-[48px] font-teko font-bold text-white leading-[0.8]">{bowler.wickets}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider -mt-1">Wkts</span>
                </div>
                <span className="text-[32px] font-teko text-gray-600 mb-2">/</span>
                <div className="flex flex-col items-start">
                    <span className="text-[48px] font-teko font-bold text-white leading-[0.8]">{bowler.runsConceded}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider -mt-1">Runs</span>
                </div>
            </div>
        </div>

        <div className="flex-1"></div>

        {/* This Over Strip */}
        <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">This Over</span>
                {/* Total runs this over calculation could go here */}
            </div>
            <div className="flex items-center gap-2 bg-[#0a0c10] p-3 rounded-lg border border-gray-800 shadow-inner overflow-x-auto">
                {currentOver.length === 0 ? (
                    <span className="text-xs text-gray-600 italic">Waiting for delivery...</span>
                ) : (
                    currentOver.map((ball) => (
                        <BallCircle key={ball.id} ball={ball} size="md" />
                    ))
                )}
                {/* Empty placeholders */}
                {Array.from({ length: Math.max(0, 6 - currentOver.length) }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-800/50"></div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BowlerCard;