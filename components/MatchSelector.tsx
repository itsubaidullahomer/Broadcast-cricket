import React, { useEffect, useState } from 'react';
import { CricAPIMatch } from '../types';
import { Loader2, RefreshCw, X } from 'lucide-react';

interface MatchSelectorProps {
  onSelectMatch: (match: CricAPIMatch) => void;
  onClose: () => void;
}

const MatchSelector: React.FC<MatchSelectorProps> = ({ onSelectMatch, onClose }) => {
  const [matches, setMatches] = useState<CricAPIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://api.cricapi.com/v1/currentMatches?apikey=9a2ea9f5-bd64-437e-b468-7ad317b1668d&offset=0'
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter out matches with no score or empty names
        const validMatches = (data.data as CricAPIMatch[]).filter(m => m.name && m.teamInfo && m.teamInfo.length === 2);
        setMatches(validMatches);
      } else {
        setError('Failed to fetch matches. API limit might be reached.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b24] border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#12161f]">
          <h2 className="text-xl broadcast-font text-white font-bold uppercase tracking-wide">Live Match Selection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 text-gray-400">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="uppercase text-xs tracking-widest font-bold">Connecting to CricketData.org...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 p-8">
              <p>{error}</p>
              <button 
                onClick={fetchMatches}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-bold uppercase"
              >
                Retry
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No live matches found at the moment.</div>
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => onSelectMatch(match)}
                  className="flex flex-col md:flex-row items-center justify-between bg-[#0d1117] hover:bg-[#1f2937] border border-gray-800 hover:border-blue-500 p-4 rounded transition-all group text-left"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {match.matchType.toUpperCase()} • {match.venue}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-white font-bold text-lg broadcast-font">
                        {match.teamInfo[0].name} <span className="text-gray-500 text-sm">vs</span> {match.teamInfo[1].name}
                      </div>
                    </div>
                    <div className="text-blue-400 text-sm font-medium mt-1">
                      {match.status}
                    </div>
                  </div>
                  
                  {match.score && match.score.length > 0 && (
                     <div className="mt-4 md:mt-0 bg-black/40 px-3 py-1.5 rounded border border-gray-700 text-right min-w-[100px]">
                        {match.score.map((s, i) => (
                           <div key={i} className="text-xs text-gray-300">
                             {s.inning.split('Inning')[0]}: <span className="text-white font-bold">{s.r}/{s.w}</span> <span className="text-gray-500">({s.o})</span>
                           </div>
                        ))}
                     </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-[#12161f] flex justify-between items-center text-xs text-gray-500">
           <span>Powered by CricketData.org</span>
           <button onClick={fetchMatches} className="flex items-center gap-2 hover:text-white transition-colors">
             <RefreshCw size={12} /> Refresh List
           </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSelector;
