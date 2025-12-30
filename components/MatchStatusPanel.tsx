import React from 'react';
import { MatchState } from '../types';

interface MatchStatusPanelProps {
  matchState: MatchState;
}

const MatchStatusPanel: React.FC<MatchStatusPanelProps> = ({ matchState }) => {
  return (
    <div className="h-[100px] bg-[#0f1219] border-t border-gray-800 grid grid-cols-[1.5fr_2fr_1.5fr] text-white relative z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
      
      {/* 1. Partnership */}
      <div className="flex flex-col justify-center px-8 border-r border-gray-800 relative bg-gradient-to-b from-[#13161f] to-[#0f1219]">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
              Current Partnership
          </div>
          <div className="flex items-baseline gap-3">
              <span className="text-[52px] font-teko font-bold leading-none text-white drop-shadow-md">{matchState.currentPartnership.runs}</span>
              <span className="text-gray-500 font-roboto text-sm font-medium uppercase tracking-wide">
                Runs <span className="text-gray-600 px-1">•</span> {matchState.currentPartnership.balls} Balls
              </span>
          </div>
      </div>

      {/* 2. Ball Analysis / Shot Info */}
      <div className="flex items-center px-8 gap-6 border-r border-gray-800 relative overflow-hidden bg-[#0a0c10]">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/5 blur-xl rounded-full"></div>

          {/* Wagon Wheel Visual Placeholder - stylized */}
          <div className="w-[54px] h-[54px] rounded-full border-2 border-gray-700/50 relative flex items-center justify-center flex-shrink-0 bg-gray-900 shadow-inner">
             <div className="w-[1px] h-full bg-gray-800"></div>
             <div className="h-[1px] w-full bg-gray-800 absolute"></div>
             <div className="absolute w-[60%] h-[60%] border border-gray-800 rounded-full border-dashed"></div>
             {matchState.lastShotAngle !== undefined && (
                <div 
                    className="absolute w-1/2 h-[2px] bg-gradient-to-r from-yellow-500 to-transparent origin-left left-1/2 top-1/2 shadow-[0_0_4px_yellow]"
                    style={{ transform: `rotate(${matchState.lastShotAngle}deg)` }}
                ></div>
             )}
          </div>

          <div className="flex flex-col z-10">
              <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Commentary</span>
                  {matchState.lastShotType && (
                     <span className="bg-blue-900/30 text-blue-200 border border-blue-500/30 px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm">
                         {matchState.lastShotType}
                     </span>
                  )}
              </div>
              <div className="text-gray-300 font-roboto text-sm leading-snug line-clamp-2 pr-4">
                  {matchState.lastBallCommentary || 'Waiting for next ball...'}
              </div>
          </div>
      </div>

      {/* 3. Last Wicket */}
      <div className="flex flex-col justify-center px-8 relative bg-gradient-to-b from-[#13161f] to-[#0f1219]">
          <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">
              Last Wicket
          </div>
          {matchState.lastWicket ? (
              <div className="flex flex-col">
                  <span className="text-[28px] font-teko font-bold leading-none text-white tracking-wide">{matchState.lastWicket.batterName}</span>
                  <div className="text-gray-500 text-xs mt-1 uppercase font-medium tracking-wide">
                      <span className="text-white font-bold">{matchState.lastWicket.runs}</span> ({matchState.lastWicket.balls}) <span className="text-gray-700 mx-1">|</span> {matchState.lastWicket.howOut}
                  </div>
              </div>
          ) : (
              <span className="text-gray-600 text-2xl font-teko font-bold uppercase">None</span>
          )}
          
          {/* Icon Decoration */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8"></path>
              </svg>
          </div>
      </div>

    </div>
  );
};

export default MatchStatusPanel;