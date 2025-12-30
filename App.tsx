import React, { useState, useEffect } from 'react';
import MatchHeader from './components/MatchHeader';
import PlayerCard from './components/PlayerCard';
import BowlerCard from './components/BowlerCard';
import MatchStatusPanel from './components/MatchStatusPanel';
import MatchSelector from './components/MatchSelector';
import { INITIAL_MATCH_STATE, FALLBACK_BATTERS, FALLBACK_BOWLERS } from './constants';
import { MatchState, BallType, Ball, CricAPIMatch } from './types';
import { Loader2, Radio, RefreshCw, Play } from 'lucide-react';

const App: React.FC = () => {
  const [matchState, setMatchState] = useState<MatchState>(INITIAL_MATCH_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  
  // Track current match ID and API Key for syncing
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

  // Initial Load: Show Match Selector immediately
  useEffect(() => {
    setShowMatchSelector(true);
  }, []);

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
        { ...prev.batsmen[0], name: 'BATTER 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
        { ...prev.batsmen[1], name: 'BATTER 2', runs: 0, balls: 0, fours: 0, sixes: 0 }
      ],
      bowler: { ...prev.bowler, name: 'BOWLER', wickets: 0, runsConceded: 0, overs: 0, maidens: 0 },
      lastBallImage: undefined
    }));
    setShowMatchSelector(false);
    
    // Trigger sync immediately (will also trigger interval setup)
    setTimeout(() => handleLiveSync(match.id, apiKey), 100);
  };

  const handleLiveSync = async (matchIdOverride?: string, apiKeyOverride?: string) => {
    // Prevent overlapping syncs
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
        console.log("API: Match Info Response", infoData);

        let newStateUpdates: Partial<MatchState> = {};
        
        // Process Basic Info
        if (infoData.status === 'success' && infoData.data) {
            const matchData = infoData.data as CricAPIMatch;
            const currentInningScore = matchData.score && matchData.score.length > 0 ? matchData.score[matchData.score.length - 1] : null;
            
            newStateUpdates = {
                ...newStateUpdates,
                totalRuns: currentInningScore ? currentInningScore.r : undefined,
                wickets: currentInningScore ? currentInningScore.w : undefined,
                overs: currentInningScore ? currentInningScore.o : undefined,
                crr: currentInningScore ? parseFloat((currentInningScore.r / (currentInningScore.o || 1)).toFixed(2)) : undefined,
                lastBallCommentary: `Score synced: ${matchData.status}`
            };
        }

        // 2. Try Fetch Scorecard
        const scoreRes = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${k}&id=${mId}`);
        const scoreData = await scoreRes.json();
        console.log("API: Scorecard Response", scoreData);

        let namesFound = false;

        if (scoreData.status === 'success' && scoreData.data && scoreData.data.scorecard) {
             const scorecard = scoreData.data.scorecard;
             if (scorecard.length > 0) {
                const lastInning = scorecard[scorecard.length - 1];
                const activeBatters = lastInning.batsman.filter((b: any) => !b.dismissal || b.dismissal === "batting" || b.dismissal === "not out");
                
                let batter1Name = 'BATTER 1'; let batter2Name = 'BATTER 2';
                
                if (activeBatters.length > 0) batter1Name = activeBatters[0].name;
                if (activeBatters.length > 1) batter2Name = activeBatters[1].name;

                // Simple check if we got real names
                if (batter1Name !== 'BATTER 1') {
                    namesFound = true;
                    // Apply updates
                    newStateUpdates.batsmen = [
                        { ...matchState.batsmen[0], name: batter1Name, runs: parseInt(activeBatters[0]?.runs)||0, balls: parseInt(activeBatters[0]?.balls)||0 },
                        { ...matchState.batsmen[1], name: batter2Name, runs: parseInt(activeBatters[1]?.runs)||0, balls: parseInt(activeBatters[1]?.balls)||0 }
                    ];
                    // Bowler logic...
                    if (lastInning.bowling && lastInning.bowling.length > 0) {
                         const lastBowler = lastInning.bowling[lastInning.bowling.length - 1];
                         newStateUpdates.bowler = { 
                             ...matchState.bowler, 
                             name: lastBowler.bowler.name, 
                             wickets: parseInt(lastBowler.wickets)||0, 
                             runsConceded: parseInt(lastBowler.runs)||0,
                             overs: parseFloat(lastBowler.overs)||0
                         };
                    }
                }
             }
        }

        // 3. Fallback: Try Squad if Scorecard failed or yielded no names
        if (!namesFound) {
            try {
                const squadRes = await fetch(`https://api.cricapi.com/v1/match_squad?apikey=${k}&id=${mId}`);
                const squadData = await squadRes.json();

                if (squadData.status === 'success' && squadData.data && Array.isArray(squadData.data) && squadData.data.length > 0) {
                    const battingTeamName = matchState.battingTeam.name;
                    const bowlingTeamName = matchState.bowlingTeam.name;
                    
                    const squads = squadData.data;
                    const battingSquadObj = squads.find((s: any) => s.teamName === battingTeamName || battingTeamName.includes(s.teamName));
                    const bowlingSquadObj = squads.find((s: any) => s.teamName === bowlingTeamName || bowlingTeamName.includes(s.teamName));
                    
                    if (battingSquadObj && battingSquadObj.players && battingSquadObj.players.length > 1) {
                         newStateUpdates.batsmen = [
                            { ...matchState.batsmen[0], name: battingSquadObj.players[0].name, runs: 0, balls: 0 }, 
                            { ...matchState.batsmen[1], name: battingSquadObj.players[1].name, runs: 0, balls: 0 }
                        ];
                        namesFound = true;
                    }

                    if (bowlingSquadObj && bowlingSquadObj.players && bowlingSquadObj.players.length > 0) {
                        const p = bowlingSquadObj.players;
                        const bowlerName = p[p.length - 1].name; 
                        newStateUpdates.bowler = {
                            ...matchState.bowler,
                            name: bowlerName,
                            wickets: 0, runsConceded: 0, overs: 0
                        }
                    }
                }
            } catch (sqErr) {
                console.log("Squad fetch error", sqErr);
            }
        }

        if (!namesFound) {
            const b1Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            let b2Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            while(b2Index === b1Index) b2Index = Math.floor(Math.random() * FALLBACK_BATTERS.length);
            
            const b1Name = FALLBACK_BATTERS[b1Index];
            const b2Name = FALLBACK_BATTERS[b2Index];
            const bowlerName = FALLBACK_BOWLERS[Math.floor(Math.random() * FALLBACK_BOWLERS.length)];

            newStateUpdates.batsmen = [
                { ...matchState.batsmen[0], name: b1Name, runs: 0, balls: 0 },
                { ...matchState.batsmen[1], name: b2Name, runs: 0, balls: 0 }
            ];
            newStateUpdates.bowler = {
                ...matchState.bowler,
                name: bowlerName,
                wickets: 0, runsConceded: 0, overs: 0
            };
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

    const timer = setInterval(() => {
        handleLiveSync();
    }, 10000); // 10s interval

    return () => clearInterval(timer);
  }, [currentMatchId, currentApiKey, matchState, isSyncing]);

  const generateNextBall = async () => {
    if (isLoading) return;
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    let currentStrikerName = matchState.batsmen.find(b => b.isStriker)?.name;
    let currentNonStrikerName = matchState.batsmen.find(b => !b.isStriker)?.name;
    let currentBowlerName = matchState.bowler.name;

    if (currentStrikerName === 'BATTER 1' || !currentStrikerName) {
        currentStrikerName = FALLBACK_BATTERS[Math.floor(Math.random() * FALLBACK_BATTERS.length)];
    }
    if (currentNonStrikerName === 'BATTER 2' || !currentNonStrikerName) {
        currentNonStrikerName = FALLBACK_BATTERS[Math.floor(Math.random() * FALLBACK_BATTERS.length)];
        if (currentNonStrikerName === currentStrikerName) currentNonStrikerName = "S. Gill"; 
    }
    if (currentBowlerName === 'BOWLER' || !currentBowlerName) {
        currentBowlerName = FALLBACK_BOWLERS[Math.floor(Math.random() * FALLBACK_BOWLERS.length)];
    }

    const rand = Math.random();
    let runs = 0;
    let isWicket = false;
    let commentary = "";
    let shotType = "Defense";

    if (rand < 0.3) { runs = 0; commentary = "Solid defensive shot back to the bowler."; shotType = "Defensive Push"; }
    else if (rand < 0.6) { runs = 1; commentary = "Worked away into the gap for a single."; shotType = "Glance"; }
    else if (rand < 0.7) { runs = 2; commentary = "Pushed hard, they come back for the second."; shotType = "Drive"; }
    else if (rand < 0.85) { runs = 4; commentary = "Beautiful shot! Races away to the boundary for Four."; shotType = "Cover Drive"; }
    else if (rand < 0.95) { runs = 6; commentary = "High and handsome! That is a massive Six!"; shotType = "Pull Shot"; }
    else { isWicket = true; commentary = "OUT! Caught in the deep!"; shotType = "Mistimed Shot"; }

    const outcome = {
        runs,
        isWicket,
        wicketType: isWicket ? 'caught' : undefined,
        shotType,
        shotAngle: Math.floor(Math.random() * 360),
        shotDirection: 'Field',
        pitchMap: 'Good Length',
        commentary,
        strikerName: currentStrikerName,
        nonStrikerName: currentNonStrikerName,
        bowlerName: currentBowlerName
    };

    processBallOutcome(outcome);
    setIsLoading(false);
  };

  const processBallOutcome = async (outcome: any) => {
    let sName = outcome.strikerName;
    let nsName = outcome.nonStrikerName;
    let bName = outcome.bowlerName;

    setMatchState(prev => {
      const newState = { ...prev };
      
      const strikerIdx = newState.batsmen.findIndex(b => b.isStriker);
      const nonStrikerIdx = newState.batsmen.findIndex(b => !b.isStriker);
      
      if (strikerIdx !== -1 && sName) newState.batsmen[strikerIdx].name = sName;
      if (nonStrikerIdx !== -1 && nsName) newState.batsmen[nonStrikerIdx].name = nsName;
      if (bName) newState.bowler.name = bName;

      let ballType = BallType.DOT;
      if (outcome.isWicket) ballType = BallType.WICKET;
      else if (outcome.runs === 4) ballType = BallType.FOUR;
      else if (outcome.runs === 6) ballType = BallType.SIX;
      else if (outcome.runs > 0) ballType = BallType.RUN;
      else if (outcome.runs === 0) ballType = BallType.DOT; 

      const newBall: Ball = {
        id: Date.now().toString(),
        type: ballType,
        runs: outcome.runs,
        value: outcome.isWicket ? 'W' : (outcome.runs === 0 ? '•' : outcome.runs),
        shotType: outcome.shotType,
        shotAngle: outcome.shotAngle,
        shotDirection: outcome.shotDirection,
        pitchMap: outcome.pitchMap,
        commentary: outcome.commentary,
        batterName: newState.batsmen.find(b => b.isStriker)?.name
      };

      newState.totalRuns += outcome.runs;
      let ballsInOver = Math.round((prev.overs % 1) * 10);
      let overs = Math.floor(prev.overs);
      ballsInOver++;
      
      if (ballsInOver >= 6) {
        overs++;
        ballsInOver = 0;
        newState.lastOver = [...prev.currentOver, newBall];
        newState.currentOver = [];
      } else {
        newState.currentOver = [...prev.currentOver, newBall];
      }
      newState.overs = parseFloat(`${overs}.${ballsInOver}`);
      newState.lastShotType = outcome.shotType;

      const strikerIndex = newState.batsmen.findIndex(b => b.isStriker);
      if (strikerIndex !== -1) {
         const striker = { ...newState.batsmen[strikerIndex] };
         striker.balls += 1; 
         striker.runs += outcome.runs;
         if (outcome.runs === 4) striker.fours += 1;
         if (outcome.runs === 6) striker.sixes += 1;
         newState.batsmen[strikerIndex] = striker;

         if (outcome.isWicket) {
             newState.wickets += 1;
             newState.lastWicket = {
                 batterName: striker.name,
                 runs: striker.runs,
                 balls: striker.balls,
                 howOut: outcome.wicketType || 'out',
                 atScore: newState.totalRuns
             };
             newState.currentPartnership = { runs: 0, balls: 0, batter1Id: 'new', batter2Id: 'new' };
             
             let nextName = FALLBACK_BATTERS[Math.floor(Math.random() * FALLBACK_BATTERS.length)];
             const nonStriker = newState.batsmen.find(b => !b.isStriker);
             while (nonStriker && nextName === nonStriker.name) {
                 nextName = FALLBACK_BATTERS[Math.floor(Math.random() * FALLBACK_BATTERS.length)];
             }

             striker.name = nextName;
             striker.runs = 0;
             striker.balls = 0;
             striker.fours = 0;
             striker.sixes = 0;
             newState.batsmen[strikerIndex] = striker;

         } else {
             newState.currentPartnership = {
                 ...prev.currentPartnership,
                 runs: prev.currentPartnership.runs + outcome.runs,
                 balls: prev.currentPartnership.balls + 1
             };
         }

         if (outcome.runs % 2 !== 0 || (ballsInOver === 0 && !outcome.isWicket)) {
             newState.batsmen.forEach(b => b.isStriker = !b.isStriker);
         }
      }

      newState.bowler = { ...prev.bowler };
      newState.bowler.runsConceded += outcome.runs;
      if (outcome.isWicket) newState.bowler.wickets += 1;
      if (ballsInOver === 0) newState.bowler.overs += 0.4;
      else newState.bowler.overs += 0.1;

      const totalOversDecimal = overs + (ballsInOver / 6);
      newState.crr = parseFloat((newState.totalRuns / (totalOversDecimal || 1)).toFixed(2));
      newState.lastBallCommentary = outcome.commentary;

      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-4 font-roboto overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#05070a] to-black opacity-80 z-0"></div>

      {showMatchSelector && (
        <MatchSelector onSelectMatch={handleMatchSelection} onClose={() => setShowMatchSelector(false)} />
      )}

      {/* Main Broadcast Container - Fixed 1280x720 aspect ratio for Exact Youtube Size */}
      <div className="relative z-10 w-[1280px] h-[720px] bg-[#0d1016] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden border border-gray-800/50 rounded-sm shrink-0">
        
        {/* Top Right Controls Overlay */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
           <button onClick={() => setShowMatchSelector(true)} className="bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-2 uppercase tracking-widest shadow-lg transition-transform hover:scale-105 backdrop-blur-sm border border-red-500/50">
             <Radio size={12} className="animate-pulse" /> Live Feed
           </button>
        </div>

        {/* Header Section */}
        <MatchHeader matchState={matchState} />

        {/* Main Split Content */}
        <div className="flex-1 flex w-full relative">
            {/* Left: Batsmen Info - Darker */}
            <div className="w-[60%] flex flex-col bg-[#11141a] border-r border-gray-800 relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
                 <div className="flex-1 flex flex-col justify-center gap-[1px] bg-[#0e1116]">
                    {/* Striker */}
                    <PlayerCard 
                        player={matchState.batsmen.find(b => b.isStriker) || matchState.batsmen[0]} 
                        isActive={true} 
                    />
                    {/* Divider Area */}
                    <div className="h-[2px] bg-black w-full"></div>
                    {/* Non-Striker */}
                    <PlayerCard 
                        player={matchState.batsmen.find(b => !b.isStriker) || matchState.batsmen[1]} 
                        isActive={false}
                    />
                 </div>
            </div>

            {/* Right: Bowler Info - Slightly Lighter */}
            <div className="w-[40%] bg-[#13171f] flex flex-col justify-center p-6 relative">
                 <BowlerCard 
                    bowler={matchState.bowler} 
                    currentOver={matchState.currentOver} 
                 />
            </div>
        </div>

        {/* Footer Info Panel */}
        <MatchStatusPanel matchState={matchState} />

      </div>

      {/* Control Deck */}
      <div className="mt-8 flex gap-4 relative z-20 p-2 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800">
        <button onClick={generateNextBall} disabled={isLoading || isSyncing} className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-teko text-xl rounded-lg shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2 leading-none">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
          {isLoading ? "Simulating..." : "Play Next Ball"}
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