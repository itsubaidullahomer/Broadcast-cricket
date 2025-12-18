import { MatchState, BallType, Team } from './types';

export const TEAM_INDIA: Team = {
  name: 'INDIA',
  shortName: 'IND',
  color: '#138808', // Saffron/Green hint
  logoColor: '#000080',
};

export const TEAM_AUSTRALIA: Team = {
  name: 'AUSTRALIA',
  shortName: 'AUS',
  color: '#FFD700', // Gold
  logoColor: '#00843D', // Green
};

export const INITIAL_MATCH_STATE: MatchState = {
  battingTeam: TEAM_INDIA,
  bowlingTeam: TEAM_AUSTRALIA,
  totalRuns: 187,
  wickets: 4,
  overs: 18.2,
  target: 246,
  crr: 10.21,
  rrr: 12.45,
  batsmen: [
    {
      id: '1',
      name: 'V KOHLI',
      runs: 82,
      balls: 49,
      fours: 7,
      sixes: 2,
      isStriker: true,
      battingStyle: 'RHB',
    },
    {
      id: '2',
      name: 'KL RAHUL',
      runs: 32,
      balls: 28,
      fours: 3,
      sixes: 1,
      isStriker: false,
      battingStyle: 'RHB',
    },
  ],
  bowler: {
    id: '101',
    name: 'M STARC',
    wickets: 1,
    runsConceded: 38,
    overs: 3.2,
    maidens: 0,
  },
  currentPartnership: {
    runs: 45,
    balls: 26,
    batter1Id: '1',
    batter2Id: '2',
  },
  lastWicket: {
    batterName: 'S YADAV',
    runs: 18,
    balls: 10,
    howOut: 'c Maxwell b Starc',
    atScore: 142,
  },
  currentOver: [
    { id: 'b1', value: 4, runs: 4, type: BallType.FOUR, shotType: 'Cover Drive', shotAngle: 280 },
    { id: 'b2', value: '•', runs: 0, type: BallType.DOT, shotType: 'Defensive Push', shotAngle: 180 },
    { id: 'b3', value: '•', runs: 0, type: BallType.DOT, shotType: 'Leave', shotAngle: 0 },
    { id: 'b4', value: 1, runs: 1, type: BallType.RUN, shotType: 'Flick', shotAngle: 110 },
    { id: 'b5', value: 1, runs: 1, type: BallType.RUN, shotType: 'Square Drive', shotAngle: 260 },
  ],
  lastOver: [
    { id: 'prev1', value: '•', runs: 0, type: BallType.DOT },
    { id: 'prev2', value: 4, runs: 4, type: BallType.FOUR },
    { id: 'prev3', value: 1, runs: 1, type: BallType.RUN },
    { id: 'prev4', value: 'W', runs: 0, type: BallType.WICKET },
    { id: 'prev5', value: 2, runs: 2, type: BallType.RUN },
    { id: 'prev6', value: 1, runs: 1, type: BallType.RUN },
  ],
  lastBallCommentary: "Starc steams in, full length delivery, driven beautifully through square for a single.",
  lastShotType: "Square Drive",
  lastShotAngle: 260, // approx west/point region
};