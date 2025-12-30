import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isActive?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive }) => {
  const sr = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0';

  return (
    <div 
        className={`flex w-full h-full relative overflow-hidden transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#1e2330] to-[#161a24] border-l-4 border-blue-500 shadow-lg' : 'bg-[#11141a] opacity-80 border-l-4 border-transparent'}`}
    >
      
      {/* Background decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-black/40 to-transparent z-0"></div>

      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-between px-6 relative z-10">
          
          {/* Left: Player Details */}
          <div className="flex items-center gap-4">
              {/* Active Indicator Icon */}
              <div className={`w-6 flex justify-center ${isActive ? 'text-blue-400' : 'text-gray-700'}`}>
                  {isActive && <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-blue-500 border-b-[8px] border-b-transparent"></div>}
              </div>

              <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className={`text-[40px] font-teko font-bold uppercase leading-[0.85] tracking-wide ${isActive ? 'text-white drop-shadow-md' : 'text-gray-400'}`}>
                        {player.name}
                    </span>
                    {isActive && <span className="text-blue-400 text-xl animate-pulse">★</span>}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm font-medium uppercase tracking-wider">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[11px] font-bold">{player.battingStyle || 'RHB'}</span>
                      <span>SR: <span className="text-gray-300 font-bold">{sr}</span></span>
                  </div>
              </div>
          </div>

          {/* Right: Stats Grid */}
          <div className="flex items-center gap-10 mr-12"> 
              <div className="flex flex-col items-center">
                  <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-1">Runs</span>
                  <span className={`text-[64px] font-teko font-bold leading-[0.75] ${isActive ? 'text-white' : 'text-gray-400'}`}>{player.runs}</span>
              </div>
              
              <div className="flex flex-col items-center px-6 border-x border-gray-800/50">
                  <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-1">Balls</span>
                  <span className="text-[40px] font-teko font-medium text-gray-300 leading-[0.8]">{player.balls}</span>
              </div>
              
              <div className="flex gap-6">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-600 font-bold uppercase mb-1">4s</span>
                    <span className="text-3xl font-teko font-bold text-blue-400 leading-[0.8]">{player.fours}</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-600 font-bold uppercase mb-1">6s</span>
                    <span className="text-3xl font-teko font-bold text-purple-400 leading-[0.8]">{player.sixes}</span>
                 </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default PlayerCard;