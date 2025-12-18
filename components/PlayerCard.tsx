import React from 'react';
import { Player } from '../types';
import { Play } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const strikeRate = ((player.runs / player.balls) * 100).toFixed(1);

  return (
    <div className={`relative flex items-center justify-between p-4 ${player.isStriker ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-l-4 border-yellow-500' : 'bg-slate-900/50 border-l-4 border-transparent'}`}>
      
      {/* Player Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
           {player.isStriker && <Play size={16} className="text-yellow-500 fill-yellow-500" />}
          <span className="text-2xl broadcast-font font-bold text-white tracking-wide uppercase">
            {player.name}
          </span>
          {player.battingStyle && (
            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                {player.battingStyle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-sm font-medium mt-1">
          <span>{player.balls} balls</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>SR <span className="text-gray-200 tabular-nums">{strikeRate}</span></span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
           <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">4s</div>
           <div className="text-xl font-bold text-blue-400 tabular-nums">{player.fours}</div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">6s</div>
           <div className="text-xl font-bold text-purple-400 tabular-nums">{player.sixes}</div>
        </div>
        <div className="flex flex-col items-end pl-4 border-l border-gray-700">
           <div className="text-4xl broadcast-font font-bold text-white tabular-nums leading-none">
             {player.runs}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;