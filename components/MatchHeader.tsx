import React from 'react';
import { MatchState } from '../types';
import { Target, TrendingUp, Activity } from 'lucide-react';

interface MatchHeaderProps {
  matchState: MatchState;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ matchState }) => {
  const { battingTeam, bowlingTeam } = matchState;

  return (
    <div className="w-full flex flex-col border-b-4 border-yellow-600 shadow-2xl relative z-10">
      
      {/* Main Score Bar */}
      <div className="flex w-full bg-[#1a1d26] h-24 items-stretch">
        
        {/* Batting Team Section */}
        <div className="flex-1 flex items-center px-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent z-0"></div>
          
          {/* Flag/Logo Area */}
          <div className="w-16 h-10 bg-white/10 rounded shadow-lg mr-6 z-10 flex items-center justify-center text-xs font-bold text-black border border-white/20 overflow-hidden">
             {battingTeam.flagUrl ? (
                <img src={battingTeam.flagUrl} alt={battingTeam.shortName} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                   {battingTeam.shortName}
                </div>
             )}
          </div>

          <div className="z-10 flex flex-col justify-center">
            <h1 className="text-4xl broadcast-font font-bold text-white leading-none tracking-tight truncate max-w-[200px] md:max-w-md">
              {battingTeam.name}
            </h1>
            <div className="text-gray-400 text-sm font-medium tracking-widest mt-1">BATTING</div>
          </div>
        </div>

        {/* Center Score Display - THE HERO */}
        <div className="flex-[0_0_auto] bg-gradient-to-b from-gray-800 to-black px-12 flex flex-col items-center justify-center border-x border-gray-700 relative shadow-2xl">
           <div className="flex items-baseline gap-2">
             <span className="text-7xl broadcast-font font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
               {matchState.totalRuns}/{matchState.wickets}
             </span>
             <span className="text-2xl font-bold text-gray-400 tabular-nums">
               ({matchState.overs})
             </span>
           </div>
           <div className="text-xs text-yellow-500 font-bold tracking-[0.2em] uppercase mt-[-4px]">
             Live
           </div>
        </div>

        {/* Bowling Team Section */}
        <div className="flex-1 flex items-center justify-end px-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-l from-yellow-900/20 to-transparent z-0"></div>
           
           <div className="z-10 flex flex-col justify-center items-end mr-6">
             <h1 className="text-4xl broadcast-font font-bold text-white leading-none tracking-tight text-right truncate max-w-[200px] md:max-w-md">
               {bowlingTeam.name}
             </h1>
             <div className="text-gray-400 text-sm font-medium tracking-widest mt-1">BOWLING</div>
           </div>

           {/* Flag/Logo Area */}
           <div className="w-16 h-10 bg-white/10 rounded shadow-lg z-10 flex items-center justify-center text-xs font-bold text-black border border-white/20 overflow-hidden">
             {bowlingTeam.flagUrl ? (
                <img src={bowlingTeam.flagUrl} alt={bowlingTeam.shortName} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                   {bowlingTeam.shortName}
                </div>
             )}
           </div>
        </div>
      </div>

      {/* Info Strip */}
      <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6 text-sm font-bold tracking-wide uppercase text-gray-300">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <span className="text-gray-400">CRR:</span>
              <span className="text-white text-lg tabular-nums">{matchState.crr}</span>
           </div>
           {matchState.rrr && (
             <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-red-400" />
                <span className="text-gray-400">RRR:</span>
                <span className="text-white text-lg tabular-nums">{matchState.rrr}</span>
             </div>
           )}
        </div>

        {matchState.target && (
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-1 rounded-sm border border-gray-700">
            <Target size={16} className="text-yellow-500" />
            <span className="text-gray-400">Target:</span>
            <span className="text-white text-lg tabular-nums">{matchState.target}</span>
            <span className="text-gray-500 text-xs normal-case ml-1">
                ({matchState.target ? matchState.target - matchState.totalRuns : 0} runs needed)
            </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default MatchHeader;
