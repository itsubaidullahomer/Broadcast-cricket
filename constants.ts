import { MatchState, BallType, Team } from './types';

export const TEAM_HOME: Team = {
  name: 'HOME TEAM',
  shortName: 'HOM',
  color: '#334155', 
  logoColor: '#ffffff',
};

export const TEAM_AWAY: Team = {
  name: 'AWAY TEAM',
  shortName: 'AWY',
  color: '#475569', 
  logoColor: '#ffffff',
};

export const INITIAL_MATCH_STATE: MatchState = {
  battingTeam: TEAM_HOME,
  bowlingTeam: TEAM_AWAY,
  totalRuns: 0,
  wickets: 0,
  overs: 0,
  target: undefined,
  crr: 0,
  rrr: undefined,
  batsmen: [
    {
      id: '1',
      name: 'BATTER 1',
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isStriker: true,
      battingStyle: 'RHB',
    },
    {
      id: '2',
      name: 'BATTER 2',
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isStriker: false,
      battingStyle: 'RHB',
    },
  ],
  bowler: {
    id: '101',
    name: 'BOWLER',
    wickets: 0,
    runsConceded: 0,
    overs: 0,
    maidens: 0,
  },
  currentPartnership: {
    runs: 0,
    balls: 0,
    batter1Id: '1',
    batter2Id: '2',
  },
  lastWicket: undefined,
  currentOver: [],
  lastOver: [],
  lastBallCommentary: "Waiting for match selection...",
  lastShotType: undefined,
  lastShotAngle: undefined,
  lastBallImage: undefined
};

// Fallback pool of realistic names for simulation when API fails
export const FALLBACK_BATTERS = [
  "R. Sharma", "T. Head", "J. Root", "K. Williamson", "B. Azam", 
  "S. Smith", "D. Warner", "S. Gill", "H. Klaasen", "G. Maxwell",
  "R. Ravindra", "Y. Jaiswal", "M. Marsh", "Q. de Kock", "J. Buttler"
];

export const FALLBACK_BOWLERS = [
  "J. Bumrah", "P. Cummins", "K. Rabada", "S. Afridi", "T. Boult",
  "M. Starc", "R. Rashid", "A. Zampa", "M. Siraj", "T. Southee"
];