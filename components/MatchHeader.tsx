import React from 'react';
import { MatchState } from '../types';

interface MatchHeaderProps {
  matchState: MatchState;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ matchState }) => {
  const { battingTeam, bowlingTeam } = matchState;

  return (
    <div className="flex flex-col w-full relative z-20 shadow-2xl">
      
      {/* Main Top Bar */}
      <div className="h-[100px] w-full flex bg-[#0f1219] border-b border-gray-800 relative overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        {/* Left: Batting Team */}
        <div className="flex items-center w-[300px] relative z-10 group">
            {/* Team Color Strip */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: battingTeam.color }}></div>
            
            {/* Team Logo/Box */}
            <div className="h-full w-[100px] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center p-3 ml-2 border-r border-gray-700/50">
                {battingTeam.flagUrl ? (
                    <img src={battingTeam.flagUrl} alt={battingTeam.shortName} className="max-h-full max-w-full object-contain drop-shadow-md" />
                ) : (
                    <span className="font-bold text-2xl text-white font-teko tracking-wider">{battingTeam.shortName}</span>
                )}
            </div>
            
            <div className="flex flex-col justify-center px-5 h-full bg-gradient-to-r from-[#1a1f29] to-transparent w-full">
                <span className="text-white text-[32px] font-teko font-bold leading-none uppercase tracking-wide drop-shadow-sm">{battingTeam.name}</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-widest border border-white/10">Batting</span>
                </div>
            </div>
            
            {/* Slant Cut */}
            <div className="absolute top-0 right-0 w-[40px] h-full bg-[#0f1219] transform skew-x-12 translate-x-4 border-l border-gray-800"></div>
        </div>

        {/* Center: Score */}
        <div className="flex-1 flex items-center justify-center relative z-20">
            {/* Live Badge */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse box-shadow-[0_0_8px_red]"></div>
                 <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">Live</span>
            </div>

            <div className="flex items-baseline gap-3 text-white mt-3">
                <span className="text-[84px] font-teko font-bold leading-none tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                    {matchState.totalRuns}<span className="text-gray-400 mx-1">/</span>{matchState.wickets}
                </span>
                <span className="text-gray-400 text-[40px] font-teko font-medium">
                    {matchState.overs}
                </span>
            </div>
        </div>

        {/* Right: Bowling Team */}
        <div className="flex items-center justify-end w-[300px] relative z-10">
             {/* Slant Cut */}
             <div className="absolute top-0 left-0 w-[40px] h-full bg-[#0f1219] transform -skew-x-12 -translate-x-4 border-r border-gray-800 z-20"></div>

            <div className="flex flex-col justify-center items-end px-5 h-full bg-gradient-to-l from-[#1a1f29] to-transparent w-full z-10">
                <span className="text-white text-[32px] font-teko font-bold leading-none uppercase tracking-wide drop-shadow-sm">{bowlingTeam.name}</span>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-widest border border-white/5">Bowling</span>
                </div>
            </div>

            {/* Team Logo/Box */}
            <div className="h-full w-[100px] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center p-3 mr-2 border-l border-gray-700/50 z-10">
                {bowlingTeam.flagUrl ? (
                    <img src={bowlingTeam.flagUrl} alt={bowlingTeam.shortName} className="max-h-full max-w-full object-contain drop-shadow-md" />
                ) : (
                    <span className="font-bold text-2xl text-white font-teko tracking-wider">{bowlingTeam.shortName}</span>
                )}
            </div>
            
             {/* Team Color Strip */}
             <div className="absolute right-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: bowlingTeam.color }}></div>
        </div>
      </div>

      {/* Info Strip (CRR, Target) - INCREASED HEIGHT */}
      <div className="h-[52px] w-full bg-[#0a0c10] border-b border-gray-800 flex items-center justify-between px-6 text-sm relative z-10">
         <div className="flex gap-10">
             <div className="flex items-end gap-3">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">CRR</span>
                <span className="text-blue-400 font-teko text-[44px] font-bold leading-[0.8]">{matchState.crr}</span>
             </div>
             {matchState.rrr && (
                <div className="flex items-end gap-3">
                    <span className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">RRR</span>
                    <span className="text-red-400 font-teko text-[44px] font-bold leading-[0.8]">{matchState.rrr}</span>
                </div>
             )}
         </div>
         
         <div className="flex items-center gap-3">
             <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Target</span>
             <span className="text-white font-teko text-3xl font-bold leading-none mt-1">{matchState.target || '-'}</span>
             {matchState.target && (
                 <span className="text-gray-500 text-sm font-medium ml-1">({matchState.target - matchState.totalRuns} needed)</span>
             )}
         </div>
      </div>

    </div>
  );
};

export default MatchHeader;