export interface Player {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isStriker?: boolean;
  battingStyle?: 'RHB' | 'LHB'; // Right Hand Bat, Left Hand Bat
}

export interface Bowler {
  id: string;
  name: string;
  wickets: number;
  runsConceded: number;
  overs: number; // e.g., 4.2
  maidens: number;
}

export enum BallType {
  DOT = 'DOT',
  RUN = 'RUN',
  FOUR = 'FOUR',
  SIX = 'SIX',
  WICKET = 'WICKET',
  WIDE = 'WIDE',
  NO_BALL = 'NO_BALL',
}

export interface Ball {
  id: string;
  value: string | number;
  type: BallType;
  runs: number;
  shotType?: string; // e.g., "Cover Drive", "Pull Shot"
  shotAngle?: number; // 0-360 degrees for wagon wheel
  shotDirection?: string; // Text description e.g. "Deep Mid Wicket"
  commentary?: string;
  batterName?: string;
  pitchMap?: string; // e.g., "Good Length", "Full", "Short"
}

export interface Team {
  name: string;
  shortName: string;
  color: string; // Hex code
  flagUrl?: string; // Optional image
  logoColor?: string; // Secondary color
}

export interface Partnership {
  runs: number;
  balls: number;
  batter1Id: string;
  batter2Id: string;
}

export interface LastWicket {
  batterName: string;
  runs: number;
  balls: number;
  howOut: string; // e.g., "b Starc", "c Warner b Cummins"
  atScore: number;
}

export interface MatchState {
  battingTeam: Team;
  bowlingTeam: Team;
  totalRuns: number;
  wickets: number;
  overs: number; // 18.2
  target?: number;
  crr: number;
  rrr?: number;
  batsmen: Player[];
  bowler: Bowler;
  currentOver: Ball[];
  lastOver?: Ball[];
  currentPartnership: Partnership;
  lastWicket?: LastWicket;
  lastBallCommentary?: string;
  lastShotType?: string;
  lastShotAngle?: number; // For visualization
}

// API Types
export interface CricAPIMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  teams: string[];
  teamInfo: {
    name: string;
    shortname: string;
    img: string;
  }[];
  score: {
    r: number;
    w: number;
    o: number;
    inning: string;
  }[];
}
