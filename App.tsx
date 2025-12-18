import React, { useState } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import MatchHeader from './components/MatchHeader';
import PlayerCard from './components/PlayerCard';
import BowlerCard from './components/BowlerCard';
import BallCircle from './components/BallCircle';
import MatchStatusPanel from './components/MatchStatusPanel';
import MatchSelector from './components/MatchSelector';
import { INITIAL_MATCH_STATE } from './constants';
import { MatchState, BallType, Ball, CricAPIMatch } from './types';
import { Loader2, Radio } from 'lucide-react';

// Enhanced schema for detailed API-like response
const ballOutcomeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    runs: { type: Type.INTEGER, description: "Runs scored (0-6)" },
    isWicket: { type: Type.BOOLEAN, description: "Is it a wicket?" },
    wicketType: { type: Type.STRING, description: "e.g. caught, bowled, lbw, or 'none'" },
    shotType: { type: Type.STRING, description: "Technical shot name (e.g. Cover Drive, Pull, Cut, Slog)" },
    shotAngle: { type: Type.INTEGER, description: "Direction angle in degrees. 0=Straight(North), 90=East, 180=Keeper(South), 270=West. Used for wagon wheel." },
    shotDirection: { type: Type.STRING, description: "Text direction (e.g. Deep Mid Wicket, Long Off)" },
    pitchMap: { type: Type.STRING, description: "Where it pitched (e.g. Yorker, Short, Good Length)" },
    commentary: { type: Type.STRING, description: "TV Broadcast style commentary" },
  },
  required: ["runs", "isWicket", "shotType", "commentary", "shotAngle", "pitchMap"]
};

const App: React.FC = () => {
  const [matchState, setMatchState] = useState<MatchState>(INITIAL_MATCH_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [showMatchSelector, setShowMatchSelector] = useState(false);

  // Handle importing data from the Live API
  const handleMatchSelection = (match: CricAPIMatch) => {
    // Basic logic to determine who is batting (last innings in the score array)
    const currentInningScore = match.score && match.score.length > 0 ? match.score[match.score.length - 1] : null;
    
    // Find batting team info
    const battingTeamName = currentInningScore ? currentInningScore.inning.split('Inning')[0].trim() : match.teamInfo[0].name;
    // Simple fuzzy match or exact match
    const battingTeamInfo = match.teamInfo.find(t => t.name.includes(battingTeamName) || battingTeamName.includes(t.name)) || match.teamInfo[0];
    const bowlingTeamInfo = match.teamInfo.find(t => t.name !== battingTeamInfo.name) || match.teamInfo[1];

    setMatchState(prev => ({
      ...prev,
      battingTeam: {
        name: battingTeamInfo.name.toUpperCase(),
        shortName: battingTeamInfo.shortname?.toUpperCase() || battingTeamInfo.name.substring(0, 3).toUpperCase(),
        color: '#1e293b', // Default dark
        flagUrl: battingTeamInfo.img
      },
      bowlingTeam: {
        name: bowlingTeamInfo.name.toUpperCase(),
        shortName: bowlingTeamInfo.shortname?.toUpperCase() || bowlingTeamInfo.name.substring(0, 3).toUpperCase(),
        color: '#334155', // Default lighter dark
        flagUrl: bowlingTeamInfo.img
      },
      totalRuns: currentInningScore ? currentInningScore.r : 0,
      wickets: currentInningScore ? currentInningScore.w : 0,
      overs: currentInningScore ? currentInningScore.o : 0,
      crr: currentInningScore ? parseFloat((currentInningScore.r / (currentInningScore.o || 1)).toFixed(2)) : 0,
      // Reset contextual stats as we don't have them from the summary API
      currentOver: [],
      lastOver: [],
      lastBallCommentary: `Live Score updated from ${match.venue}`,
      lastShotType: '',
      lastShotAngle: undefined,
      currentPartnership: { runs: 0, balls: 0, batter1Id: '1', batter2Id: '2' }, // Reset
      // Keep batsmen generic or reset names
      batsmen: [
        { ...prev.batsmen[0], name: 'BATTER 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
        { ...prev.batsmen[1], name: 'BATTER 2', runs: 0, balls: 0, fours: 0, sixes: 0 }
      ],
      bowler: { ...prev.bowler, name: 'BOWLER', wickets: 0, runsConceded: 0, overs: 0, maidens: 0 }
    }));
    
    setShowMatchSelector(false);
  };

  // This function acts as our "Intelligence Engine" to simulate specific ball details 
  // that are not provided by the basic free API (like shot angles, pitch maps).
  const generateNextBall = async () => {
    if (isLoading) return;

    // API Key Check
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) {
        await window.aistudio?.openSelectKey();
    }
    
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-3-flash-preview"; 

      const striker = matchState.batsmen.find(b => b.isStriker);
      
      // High-Fidelity Data Prompt simulating the live feed details
      const prompt = `
        Act as a live cricket data feed API for the match: ${matchState.battingTeam.name} vs ${matchState.bowlingTeam.name}.
        Current Score: ${matchState.totalRuns}/${matchState.wickets} (${matchState.overs} ov).
        
        Batter on strike: ${striker?.name}.
        
        Generate the NEXT ball outcome. 
        Note: If this is a real match simulation, assume a realistic event that just happened.
        
        Return JSON data.
      `;

      const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ballOutcomeSchema,
          temperature: 0.8
        }
      });

      const outcome = JSON.parse(result.text || "{}");
      
      if (outcome) {
        processBallOutcome(outcome);
      }

    } catch (error) {
      console.error("Error generating ball:", error);
      alert("Failed to fetch ball data.");
    } finally {
      setIsLoading(false);
    }
  };

  const processBallOutcome = (outcome: any) => {
    setMatchState(prev => {
      const newState = { ...prev };
      
      // 1. Create Detailed Ball Object
      let ballType = BallType.DOT;
      if (outcome.isWicket) ballType = BallType.WICKET;
      else if (outcome.runs === 4) ballType = BallType.FOUR;
      else if (outcome.runs === 6) ballType = BallType.SIX;
      else if (outcome.runs > 0) ballType = BallType.RUN;

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

      // 2. Update Match Score
      newState.totalRuns += outcome.runs;
      
      // 3. Update Overs Logic
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

      // 4. Update Batsman Stats
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
             // Reset striker for next batter
             newState.currentPartnership = { runs: 0, balls: 0, batter1Id: 'new', batter2Id: 'new' };
             striker.name = "NEW BATTER";
             striker.runs = 0;
             striker.balls = 0;
             striker.fours = 0;
             striker.sixes = 0;
             newState.batsmen[strikerIndex] = striker;
         } else {
             // Update Partnership
             newState.currentPartnership = {
                 ...prev.currentPartnership,
                 runs: prev.currentPartnership.runs + outcome.runs,
                 balls: prev.currentPartnership.balls + 1
             };
         }

         // Swap Ends logic
         if (outcome.runs % 2 !== 0 || (ballsInOver === 0 && !outcome.isWicket)) {
             newState.batsmen.forEach(b => b.isStriker = !b.isStriker);
         }
      }

      // 5. Update Bowler Stats
      newState.bowler = { ...prev.bowler };
      newState.bowler.runsConceded += outcome.runs;
      if (outcome.isWicket) newState.bowler.wickets += 1;
      if (ballsInOver === 0) newState.bowler.overs += 0.4;
      else newState.bowler.overs += 0.1;

      // 6. Update CRR
      const totalOversDecimal = overs + (ballsInOver / 6);
      newState.crr = parseFloat((newState.totalRuns / (totalOversDecimal || 1)).toFixed(2));

      // 7. Store latest narrative info
      newState.lastBallCommentary = outcome.commentary;
      newState.lastShotType = outcome.shotType;
      newState.lastShotAngle = outcome.shotAngle;

      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center p-4">
      
      {showMatchSelector && (
        <MatchSelector 
          onSelectMatch={handleMatchSelection} 
          onClose={() => setShowMatchSelector(false)} 
        />
      )}

      {/* Broadcast Container */}
      <div className="w-full max-w-7xl bg-[#12161f] shadow-2xl overflow-hidden border border-gray-800 rounded-sm relative">
        
        {/* Top Control Bar (Hidden in Broadcast usually, but visible here for control) */}
        <div className="absolute top-2 right-2 z-50">
           <button 
             onClick={() => setShowMatchSelector(true)}
             className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-2 uppercase tracking-wider shadow-lg"
           >
             <Radio size={12} className="animate-pulse" /> Live Feed
           </button>
        </div>

        {/* Top Header */}
        <MatchHeader matchState={matchState} />

        {/* Main Split Content */}
        <div className="grid grid-cols-12 h-auto md:h-80 border-t border-gray-800">
          
          {/* Left: Batsmen Panel */}
          <div className="col-span-12 md:col-span-7 flex flex-col border-r border-gray-800 bg-[#161b24]">
             {matchState.batsmen.map((player) => (
               <div key={player.id} className="flex-1 border-b border-gray-800 last:border-0">
                  <PlayerCard player={player} />
               </div>
             ))}
          </div>

          {/* Right: Bowler Panel */}
          <div className="col-span-12 md:col-span-5 bg-[#161b24]">
            <BowlerCard bowler={matchState.bowler} currentOver={matchState.currentOver} />
          </div>

        </div>

        {/* New Status Panel (Detailed Info with Shot Map) */}
        <MatchStatusPanel matchState={matchState} />

        {/* Footer: Timeline */}
        <div className="h-16 bg-black flex items-center px-6 border-t border-gray-800">
           <div className="text-gray-500 font-bold uppercase text-sm tracking-wider mr-6 whitespace-nowrap">
             Timeline
           </div>
           
           <div className="flex items-center gap-4 overflow-hidden relative w-full">
             <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
             
             <div className="flex gap-3 items-center opacity-50 pl-2">
                {(matchState.lastOver || []).map((ball) => (
                    <BallCircle key={ball.id} ball={ball} size="sm" className="opacity-60 grayscale" />
                ))}
                <div className="w-px h-8 bg-gray-700 mx-2"></div>
             </div>
             
             <div className="flex gap-3 items-center">
                {matchState.currentOver.map((ball) => (
                    <BallCircle key={ball.id} ball={ball} size="md" />
                ))}
             </div>
           </div>
        </div>

      </div>

      {/* Control Panel */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={generateNextBall}
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-gray-400 text-white font-bold rounded shadow-lg transition uppercase tracking-wider text-sm flex items-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              FETCHING DETAILS...
            </>
          ) : (
            <>
              SIMULATE NEXT BALL
            </>
          )}
        </button>
      </div>
      <div className="mt-2 text-gray-500 text-xs text-center uppercase tracking-widest max-w-xl">
        Hybrid Mode: Live Scores from CricketData.org | Granular Details (Shot/Pitch) by Gemini AI
      </div>

    </div>
  );
};

export default App;
