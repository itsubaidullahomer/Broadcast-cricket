import React from 'react';
import { MatchState } from '../types';
import { Users, AlertCircle, MonitorPlay, MapPin } from 'lucide-react';
import ShotMap from './ShotMap';

interface MatchStatusPanelProps {
  matchState: MatchState;
}

const MatchStatusPanel: React.FC<MatchStatusPanelProps> = ({ matchState }) => {
  const { currentPartnership, lastWicket, lastBallCommentary, lastShotType, lastShotAngle } = matchState;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-gray-800 bg-[#161b24] text-white">
      
      {/* Partnership Card (Col 1-4) */}
      <div className="col-span-12 md:col-span-3 p-4 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
            <Users size={64} />
        </div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <Users size={14} className="text-blue-400"/> Current Partnership
        </div>
        <div className="flex items-baseline gap-2 z-10">
            <span className="text-4xl broadcast-font font-bold text-white">{currentPartnership.runs}</span>
            <span className="text-gray-400 font-medium text-sm">run ({currentPartnership.balls} balls)</span>
        </div>
      </div>

      {/* Shot Visualization & Commentary (Center Stage) (Col 5-9) */}
      <div className="col-span-12 md:col-span-6 p-4 border-b md:border-b-0 md:border-r border-gray-800 bg-[#12161f] relative flex items-center gap-6">
         
         {/* The Visualizer */}
         <div className="flex-shrink-0">
            <ShotMap angle={lastShotAngle} shotType={lastShotType} />
         </div>

         {/* The Analysis */}
         <div className="flex flex-col justify-center flex-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <MonitorPlay size={14} className="text-yellow-500"/> Ball Tracking Analysis
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {lastShotType && (
                    <div className="bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 px-2 py-0.5 text-xs font-bold uppercase rounded">
                        {lastShotType}
                    </div>
                )}
                 {matchState.currentOver[matchState.currentOver.length - 1]?.pitchMap && (
                     <div className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-2 py-0.5 text-xs font-bold uppercase rounded flex items-center gap-1">
                        <MapPin size={10} /> {matchState.currentOver[matchState.currentOver.length - 1].pitchMap}
                    </div>
                 )}
            </div>
            
            <p className="text-sm text-gray-300 italic leading-snug">
                "{lastBallCommentary || 'Waiting for next ball...'}"
            </p>
         </div>
      </div>

      {/* Last Wicket (Col 10-12) */}
      <div className="col-span-12 md:col-span-3 p-4 flex flex-col justify-center relative">
         <div className="absolute top-0 right-0 p-2 opacity-10">
            <AlertCircle size={64} className="text-red-500" />
        </div>
         <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400"/> Last Wicket
        </div>
        {lastWicket ? (
            <div className="z-10">
                <div className="text-xl broadcast-font font-bold text-white">{lastWicket.batterName}</div>
                <div className="text-sm text-gray-400 font-medium">
                    {lastWicket.runs} ({lastWicket.balls}) <span className="text-gray-600 mx-1">|</span> {lastWicket.howOut}
                </div>
            </div>
        ) : (
            <span className="text-gray-500 text-sm">None</span>
        )}
      </div>

    </div>
  );
};

export default MatchStatusPanel;