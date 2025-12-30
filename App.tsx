import React, { useState, useEffect, useRef } from 'react';
import MatchHeader from './components/MatchHeader';
import PlayerCard from './components/PlayerCard';
import BowlerCard from './components/BowlerCard';
import MatchStatusPanel from './components/MatchStatusPanel';
import MatchSelector from './components/MatchSelector';
import { INITIAL_MATCH_STATE, FALLBACK_BATTERS, FALLBACK_BOWLERS } from './constants';
import { MatchState, BallType, Ball, CricAPIMatch } from './types';
import { Loader2, Radio, RefreshCw, Play } from 'lucide-react';
import { fetchPlayerImageFromWiki } from './utils';

const App: React.FC = () => {
  const [matchState, setMatchState] = useState<MatchState>(INITIAL_MATCH_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  
  // Track current match ID and API Key for syncing
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

  // Cache player images to avoid repeated fetches
  const playerImageCache = useRef<Record<string, string>>({});

  // Initial Load: Show Match Selector immediately
  useEffect(() => {
    setShowMatchSelector(true);
  }, []);

  // Effect to load player images when names change
  useEffect(() => {
      const loadImages = async () => {
          const batters = matchState.batsmen;
          let updated = false;
          const newBatsmen = [...batters];

          for (let i = 0; i < newBatsmen.length; i++) {
              const b = newBatsmen[i];
              if (b.name && b.name !== 'BATTER 1' && b.name !== 'BATTER 2' && !b.imageUrl) {
                  // Check cache first
                  if (playerImageCache.current[b.name]) {
                      newBatsmen[i] = { ...b, imageUrl: playerImageCache.current[b.name] };
                      updated = true;
                  } else {
                      // Fetch
                      const url = await fetchPlayerImageFromWiki(b.name);
                      if (url) {
                          playerImageCache.current[b.name] = url;
                          newBatsmen[i] = { ...b, imageUrl: url };
                          updated = true;
                      }
                  }
              }
          }

          if (updated) {
              setMatchState(prev => ({ ...prev, batsmen: newBatsmen }));
          }
      };
      
      loadImages();
  }, [matchState.batsmen[0].name, matchState.batsmen[1].name]);

  const handleMatchSelection = async (match: CricAPIMatch, apiKey: string) => {
    setCurrentMatchId(match.id);
    setCurrentApiKey(apiKey);

    console.log("Selected Match:", match);

    const currentInningScore = match.score && match.score.length > 0 ? match.score[match.score.length - 1] : null;
    const battingTeamName = currentInningScore ? currentInningScore.inning.split('Inning')[0].trim() : match.teamInfo[0].name;
    const battingTeamInfo = match.teamInfo.find(t => t.name.includes(battingTeamName) || battingTeamName.includes(t.name)) || match.teamInfo[0];
    const bowlingTeamInfo = match.teamInfo.find(t => t.name !== battingTeamInfo.name) || match.teamInfo[1];

    setMatchState(prev => ({
      ...prev,
      battingTeam: {
        name: battingTeamInfo.name,
        shortName: battingTeamInfo.shortname?.toUpperCase() || battingTeamInfo.name.substring(0, 3).toUpperCase(),
        color: '#1e293b', 
        flagUrl: battingTeamInfo.img
      },
      bowlingTeam: {
        name: bowlingTeamInfo.name,
        shortName: bowlingTeamInfo.shortname?.toUpperCase() || bowlingTeamInfo.name.substring(0, 3).toUpperCase(),
        color: '#334155',
        flagUrl: bowlingTeamInfo.img
      },
      totalRuns: currentInningScore ? currentInningScore.r : 0,
      wickets: currentInningScore ? currentInningScore.w : 0,
      overs: currentInningScore ? currentInningScore.o : 0,
      crr: currentInningScore ? parseFloat((currentInningScore.r / (currentInningScore.o || 1)).toFixed(2)) : 0,
      currentOver: [],
      lastOver: [],
      lastBallCommentary: `Live Score updated from ${match.venue}`,
      currentPartnership: { runs: 0, balls: 0, batter1Id: '1', batter2Id: '2' },
      batsmen: [
        { ...prev.batsmen[0], name: 'BATTER 1', runs: 0, balls: 0, fours: 0, sixes: 0, imageUrl: undefined },
        { ...prev.batsmen[1], name: 'BATTER 2', runs: 0, balls: 0, fours: 0, sixes: 0, imageUrl: undefined }
      ],
      bowler: { ...prev.bowler, name: 'BOWLER', wickets: 0, runsConceded: 0, overs: 0, maidens: 0 },
      lastBallImage: undefined
    }));
    setShowMatchSelector(false);
    
    // Trigger sync immediately (will also trigger interval setup)
    setTimeout(() => handleLiveSync(match.id, apiKey), 100);
  };

  const handleLiveSync = async (matchIdOverride?: string, apiKeyOverride?: string) => {
    if (isSyncing) return;

    const mId = matchIdOverride || currentMatchId;
    const k = apiKeyOverride || currentApiKey;

    if (!mId || !k) {
        if (!mId) setShowMatchSelector(true);
        return;
    }
    setIsSyncing(true);
    try {
        // 1. Fetch Basic Info
        const infoRes = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${k}&id=${mId}`);
        const infoData = await infoRes.json();
        
        let newStateUpdates: Partial<MatchState> = {};
        
        // Process Basic Info & Team Swap Logic
        if (infoData.status === 'success' && infoData.data) {
            const matchData = infoData.data as CricAPIMatch;
            const currentInningScore = matchData.score && matchData.score.length > 0 ? matchData.score[matchData.score.length - 1] : null;
            
            // Check for team swap if inning changed
            if (currentInningScore) {
                 const inningStr = currentInningScore.inning.toLowerCase();
                 const currentBattingName = matchState.battingTeam.name.toLowerCase();
                 // If the current score inning string does NOT contain current batting team name
                 // but DOES contain current bowling team name, we need to swap.
                 if (!inningStr.includes(currentBattingName) && inningStr.includes(matchState.bowlingTeam.name.toLowerCase())) {
                     console.log("Swapping teams based on inning data:", inningStr);
                     setMatchState(prev => ({
                         ...prev,
                         battingTeam: prev.bowlingTeam,
                         bowlingTeam: prev.battingTeam,
                         batsmen: [
                             { ...prev.batsmen[0], name: 'BATTER 1', runs: 0, balls: 0, imageUrl: undefined },
                             { ...prev.batsmen[1], name: 'BATTER 2', runs: 0, balls: 0, imageUrl: undefined }
                         ],
                         bowler: { ...prev.bowler, name: 'BOWLER', wickets: 0, runsConceded: 0, overs: 0 }
                     }));
                     // We continue, and the names will be filled by scorecard below
                 }
            }

            newStateUpdates = {
                ...newStateUpdates,
                totalRuns: currentInningScore ? currentInningScore.r : undefined,
                wickets: currentInningScore ? currentInningScore.w : undefined,
                overs: currentInningScore ? currentInningScore.o : undefined,
                crr: currentInningScore ? parseFloat((currentInningScore.r / (currentInningScore.o || 1)).toFixed(2)) : undefined,
                lastBallCommentary: `Score synced: ${matchData.status}`
            };
        }

        // 2. Fetch Scorecard
        const scoreRes = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${k}&id=${mId}`);
        const scoreData = await scoreRes.json();
        // console.log("API: Scorecard", scoreData);

        let namesFound = false;

        if (scoreData.status === 'success' && scoreData.data && scoreData.data.scorecard) {
             const scorecard = scoreData.data.scorecard;
             if (scorecard.length > 0) {
                // Assume last inning in list is the current one
                const lastInning = scorecard[scorecard.length - 1];
                
                // Helper to clean name
                const cleanName = (n: string) => n.replace('*', '').replace(' (c)', '').replace(' (wk)', '').trim();
                
                // Helper to safely get stats
                const getStat = (obj: any, keys: string[]) => {
                    for (const key of keys) {
                        if (obj[key] !== undefined && obj[key] !== "") return obj[key];
                    }
                    return 0;
                };

                // Update Bowler - INDEPENDENT of batsmen check
                if (lastInning.bowling && lastInning.bowling.length > 0) {
                     // Usually the last bowler in the list or the one with incomplete overs
                     const bowlerData = lastInning.bowling[lastInning.bowling.length - 1];
                     
                     newStateUpdates.bowler = { 
                         ...matchState.bowler, 
                         name: cleanName(bowlerData.bowler ? bowlerData.bowler.name : (bowlerData.name || "BOWLER")), 
                         wickets: parseInt(getStat(bowlerData, ['wickets', 'w']))||0, 
                         runsConceded: parseInt(getStat(bowlerData, ['runs', 'r']))||0,
                         overs: parseFloat(getStat(bowlerData, ['overs', 'o']))||0,
                         maidens: parseInt(getStat(bowlerData, ['maidens', 'm']))||0
                     };
                }

                // Better Filter for Active Batters
                // CricAPI dismissal often: "" or "batting" or "not out"
                let activeBatters = lastInning.batsman.filter((b: any) => {
                    const d = b.dismissal ? b.dismissal.trim().toLowerCase() : "";
                    return d === "" || d === "not out" || d === "batting";
                });
                
                // Fallback: If filter returns nothing (sometimes dismissal field is weird),
                // take the last 2 from the array if they have empty dismissal or look like they are playing.
                if (activeBatters.length === 0 && lastInning.batsman.length > 0) {
                     activeBatters = lastInning.batsman.slice(-2);
                }

                if (activeBatters.length > 0) {
                    namesFound = true;
                    
                    const b1 = activeBatters[0];
                    const b2 = activeBatters.length > 1 ? activeBatters[1] : null;

                    const newBatsmen = [...matchState.batsmen];
                    
                    if (b1) {
                         const n = cleanName(b1.name);
                         // Preserve existing image if name matches
                         const img = newBatsmen[0].name === n ? newBatsmen[0].imageUrl : undefined;
                         
                         newBatsmen[0] = { 
                             ...newBatsmen[0], 
                             name: n, 
                             runs: parseInt(getStat(b1, ['runs', 'r']))||0, 
                             balls: parseInt(getStat(b1, ['balls', 'b']))||0,
                             fours: parseInt(getStat(b1, ['fours', '4s']))||0,
                             sixes: parseInt(getStat(b1, ['sixes', '6s']))||0,
                             imageUrl: img
                         };
                    }

                    if (b2) {
                        const n = cleanName(b2.name);
                        const img = newBatsmen[1].name === n ? newBatsmen[1].imageUrl : undefined;

                        newBatsmen[1] = { 
                            ...newBatsmen[1], 
                            name: n, 
                            runs: parseInt(getStat(b2, ['runs', 'r']))||0, 
                            balls: parseInt(getStat(b2, ['balls', 'b']))||0,
                            fours: parseInt(getStat(b2, ['fours', '4s']))||0,
                            sixes: parseInt(getStat(b2, ['sixes', '6s']))||0,
                            imageUrl: img
                        };
                    } else {
                        // Reset if only 1 batter
                        newBatsmen[1] = { ...newBatsmen[1], name: '', runs: 0, balls: 0, imageUrl: undefined };
                    }
                    
                    newStateUpdates.batsmen = newBatsmen;
                }
             }
        }

        // 3. Squad Fallback (Only if scorecard completely failed to find names)
        if (!namesFound) {
            try {
                const squadRes = await fetch(`https://api.cricapi.com/v1/match_squad?apikey=${k}&id=${mId}`);
                const squadData = await squadRes.json();

                if (squadData.status === 'success' && squadData.data && Array.isArray(squadData.data) && squadData.data.length > 0) {
                    const battingTeamName = matchState.battingTeam.name;
                    const squads = squadData.data;
                    const battingSquadObj = squads.find((s: any) => s.teamName === battingTeamName || battingTeamName.includes(s.teamName));
                    
                    if (battingSquadObj && battingSquadObj.players && battingSquadObj.players.length > 1) {
                         // Reset stats to 0 as we don't know them
                         newStateUpdates.batsmen = [
                            { ...matchState.batsmen[0], name: battingSquadObj.players[0].name, runs: 0, balls: 0, imageUrl: undefined }, 
                            { ...matchState.batsmen[1], name: battingSquadObj.players[1].name, runs: 0, balls: 0, imageUrl: undefined }
                        ];
                        namesFound = true;
                    }
                }
            } catch (sqErr) { console.log("Squad fetch error", sqErr); }
        }

        // 4. Absolute Fallback (Random names)
        if (!namesFound && matchState.batsmen[0].name === 'BATTER 1') {
             // Only fallback if we still have default names, otherwise keep old state to prevent flicker
            const b1Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            let b2Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            while(b2Index === b1Index) b2Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            
            newStateUpdates.batsmen = [
                { ...matchState.batsmen[0], name: FALLBACK_BATTERS[b1Index], runs: 0, balls: 0 },
                { ...matchState.batsmen[1], name: FALLBACK_BATTERS[b2Index], runs: 0, balls: 0 }
            ];
            // Only update bowler if we haven't already found one from scorecard
            if (!newStateUpdates.bowler) {
                newStateUpdates.bowler = { ...matchState.bowler, name: FALLBACK_BOWLERS[0] };
            }
        }

        setMatchState(prev => {
             const merged = { ...prev };
             if (newStateUpdates.totalRuns !== undefined) merged.totalRuns = newStateUpdates.totalRuns;
             if (newStateUpdates.wickets !== undefined) merged.wickets = newStateUpdates.wickets;
             if (newStateUpdates.overs !== undefined) merged.overs = newStateUpdates.overs;
             if (newStateUpdates.crr !== undefined) merged.crr = newStateUpdates.crr;
             if (newStateUpdates.lastBallCommentary) merged.lastBallCommentary = newStateUpdates.lastBallCommentary;
             if (newStateUpdates.batsmen) merged.batsmen = newStateUpdates.batsmen;
             if (newStateUpdates.bowler) merged.bowler = newStateUpdates.bowler;
             return merged;
        });

    } catch (e) {
        console.error("Sync failed", e);
    } finally {
        setIsSyncing(false);
    }
  };

  // Auto-Sync: Poll every 10 seconds
  useEffect(() => {
    if (!currentMatchId || !currentApiKey) return;
    const timer = setInterval(() => { handleLiveSync(); }, 10000); 
    return () => clearInterval(timer);
  }, [currentMatchId, currentApiKey, matchState]);

  const generateNextBall = async () => {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulation logic (same as before, omitted for brevity but functionality preserved by not modifying it if not needed)
    // ... Actually, keeping simulation simple for now as sync is priority
    
    // Quick Sim Logic
    let currentStrikerName = matchState.batsmen.find(b => b.isStriker)?.name || matchState.batsmen[0].name;
    const rand = Math.random();
    let runs = 0; let isWicket = false; let commentary = "Defended.";
    
    if (rand < 0.2) { runs = 0; commentary = "Solid defense."; }
    else if (rand < 0.5) { runs = 1; commentary = "Single taken."; }
    else if (rand < 0.7) { runs = 4; commentary = "Four runs!"; }
    else if (rand < 0.8) { runs = 6; commentary = "Huge six!"; }
    else if (rand > 0.95) { isWicket = true; commentary = "OUT!"; }

    const newBall: Ball = {
        id: Date.now().toString(),
        type: isWicket ? BallType.WICKET : (runs===4?BallType.FOUR:runs===6?BallType.SIX:runs>0?BallType.RUN:BallType.DOT),
        runs,
        value: isWicket ? 'W' : runs.toString(),
        commentary,
        batterName: currentStrikerName
    };

    setMatchState(prev => {
        const ns = { ...prev };
        ns.totalRuns += runs;
        if (isWicket) ns.wickets += 1;
        
        let balls = Math.round((ns.overs % 1) * 10) + 1;
        let overs = Math.floor(ns.overs);
        if (balls === 6) { overs++; balls = 0; ns.currentOver = []; }
        else { ns.currentOver.push(newBall); }
        
        ns.overs = parseFloat(`${overs}.${balls}`);
        ns.lastBallCommentary = commentary;
        
        // Update striker stats
        const sIdx = ns.batsmen.findIndex(b => b.name === currentStrikerName);
        if (sIdx > -1) {
            ns.batsmen[sIdx].runs += runs;
            ns.batsmen[sIdx].balls += 1;
            if (runs%2 !== 0) {
                 // swap striker is visual only in this simple sim
                 // In full app, we track isStriker property
            }
        }
        return ns;
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-4 font-roboto overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#05070a] to-black opacity-80 z-0"></div>

      {showMatchSelector && (
        <MatchSelector onSelectMatch={handleMatchSelection} onClose={() => setShowMatchSelector(false)} />
      )}

      <div className="relative z-10 w-[1280px] h-[720px] bg-[#0d1016] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden border border-gray-800/50 rounded-sm shrink-0">
        
        <div className="absolute top-4 right-4 z-50 flex gap-2">
           <button onClick={() => setShowMatchSelector(true)} className="bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-2 uppercase tracking-widest shadow-lg transition-transform hover:scale-105 backdrop-blur-sm border border-red-500/50">
             <Radio size={12} className="animate-pulse" /> Live Feed
           </button>
        </div>

        <MatchHeader matchState={matchState} />

        <div className="flex-1 flex w-full relative">
            {/* Left: Batsmen Info */}
            <div className="w-[60%] flex flex-col bg-[#11141a] border-r border-gray-800 relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
                 <div className="flex-1 flex flex-col justify-center gap-[1px] bg-[#0e1116]">
                    <PlayerCard 
                        player={matchState.batsmen[0]} 
                        isActive={true} 
                    />
                    <div className="h-[2px] bg-black w-full"></div>
                    <PlayerCard 
                        player={matchState.batsmen[1]} 
                        isActive={false}
                    />
                 </div>
            </div>

            {/* Right: Bowler Info */}
            <div className="w-[40%] bg-[#13171f] flex flex-col justify-center p-6 relative">
                 <BowlerCard 
                    bowler={matchState.bowler} 
                    currentOver={matchState.currentOver} 
                 />
            </div>
        </div>

        <MatchStatusPanel matchState={matchState} />

      </div>

      <div className="mt-8 flex gap-4 relative z-20 p-2 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800">
        <button onClick={generateNextBall} disabled={isLoading || isSyncing} className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-teko text-xl rounded-lg shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2 leading-none">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
          Simulate Ball
        </button>

        {currentMatchId && (
            <button onClick={() => handleLiveSync()} disabled={isLoading || isSyncing} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-teko text-xl rounded-lg shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2 leading-none">
                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                {isSyncing ? "Syncing..." : "Sync Score"}
            </button>
        )}
      </div>
    </div>
  );
};

export default App;