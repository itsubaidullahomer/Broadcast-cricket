import React, { useEffect, useState } from 'react';
import { CricAPIMatch } from '../types';
import { Loader2, RefreshCw, X, Radio, Key, Calendar, Trophy } from 'lucide-react';

interface MatchSelectorProps {
  onSelectMatch: (match: CricAPIMatch, apiKey: string) => void;
  onClose: () => void;
}

const DEFAULT_API_KEY = '321b5c32-f633-48d7-8045-6309e6f53242'; // Updated API Key

const MatchSelector: React.FC<MatchSelectorProps> = ({ onSelectMatch, onClose }) => {
  const [matches, setMatches] = useState<CricAPIMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cric_api_key') || DEFAULT_API_KEY);
  const [isEditingKey, setIsEditingKey] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        const validMatches = (data.data as CricAPIMatch[]).filter(m => m.name && m.teamInfo && m.teamInfo.length === 2);
        setMatches(validMatches);
        localStorage.setItem('cric_api_key', apiKey);
      } else {
        setError(data.reason || 'Failed to fetch matches. Check API Key or limit.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [apiKey]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSaveKey = () => {
      setIsEditingKey(false);
      fetchMatches();
  }

  const liveMatches = matches.filter(m => m.matchStarted && !m.matchEnded);
  const otherMatches = matches.filter(m => !m.matchStarted || m.matchEnded);

  const formatDate = (dateStr: string) => {
      try {
          return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
          return dateStr;
      }
  };

  const MatchItem: React.FC<{ match: CricAPIMatch }> = ({ match }) => (
    <button
      onClick={() => onSelectMatch(match, apiKey)}
      className="flex flex-col w-full bg-[#161b24] hover:bg-[#1f2530] border border-gray-800 hover:border-blue-500/50 p-0 rounded-lg transition-all group overflow-hidden shadow-sm"
    >
        {/* Top Status Strip */}
        <div className="w-full bg-[#0a0c10] px-4 py-2 flex items-center justify-between border-b border-gray-800">
             <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                <Trophy size={10} className="text-yellow-600" />
                {match.matchType}
                <span className="text-gray-700">•</span>
                {match.venue}
             </div>
             {match.matchStarted && !match.matchEnded ? (
                 <span className="text-[9px] font-bold bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live
                 </span>
             ) : (
                <span className="text-[10px] text-gray-600 font-bold">{formatDate(match.date)}</span>
             )}
        </div>

        {/* Content */}
        <div className="p-4 flex justify-between items-center w-full">
            <div className="flex flex-col items-start gap-1">
                <div className="text-xl font-teko font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors">
                    {match.teamInfo[0].name} <span className="text-gray-600 mx-1">vs</span> {match.teamInfo[1].name}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    {match.status}
                </div>
            </div>

            {/* Score Pill */}
            {match.score && match.score.length > 0 && (
                <div className="flex flex-col items-end gap-1">
                    {match.score.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-gray-700/50">
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{s.inning.split('Inning')[0]}</span>
                            <span className="text-white font-teko font-bold text-lg leading-none">{s.r}/{s.w}</span>
                            <span className="text-gray-500 text-xs">({s.o})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#11151c] border border-gray-700 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col border-b border-gray-800 bg-[#0d1016]">
            <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="text-2xl font-teko text-white font-bold uppercase tracking-wide">Match Selection</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 p-2 rounded-full">
                    <X size={20} />
                </button>
            </div>
            
            {/* Key Config */}
            <div className="px-5 pb-5 pt-0">
                 {/* Compact key switch */}
                 {!isEditingKey ? (
                     <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
                            <Key size={12} />
                            <span className="font-mono">••••{apiKey.slice(-4)}</span>
                        </div>
                        <button onClick={() => setIsEditingKey(true)} className="text-blue-500 hover:text-blue-400 font-bold uppercase">Change Key</button>
                     </div>
                 ) : (
                    <div className="flex gap-2 animate-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            value={apiKey} 
                            onChange={handleKeyChange}
                            className="flex-1 bg-black border border-gray-700 text-white text-xs p-2 rounded focus:border-blue-500 outline-none font-mono"
                        />
                        <button onClick={handleSaveKey} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold uppercase">Save</button>
                    </div>
                 )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#0e1117]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 text-gray-500">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <span className="uppercase text-xs tracking-widest font-bold">Scanning for Live Data...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
              <p>{error}</p>
              <button onClick={fetchMatches} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-bold uppercase text-white transition-colors">Retry</button>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No active matches found.</div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {liveMatches.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Now
                  </div>
                  {liveMatches.map(match => (
                    <MatchItem key={match.id} match={match} />
                  ))}
                </div>
              )}

              {otherMatches.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1 border-t border-gray-800 pt-4">
                    Upcoming & Recent
                  </div>
                  {otherMatches.map(match => (
                    <MatchItem key={match.id} match={match} />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-800 bg-[#0d1016] flex justify-center">
           <button onClick={fetchMatches} className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-wider">
             <RefreshCw size={12} /> Refresh Match List
           </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSelector;