export type Role = 'WK' | 'OP' | 'MO' | 'AR' | 'BWL' | 'SP';

export type TournamentFormat = 'odi' | 't20';
export type GameMode = 'classic' | 'almanac';
export type PlayStyle = 'defensive' | 'balanced' | 'attacking';
export type GamePhase = 'setup' | 'drafting' | 'simulating' | 'complete';

export interface Player {
  id: string;
  number: number;
  name: string;
  roles: Role[];
  rating: number;
}

export interface Squad {
  id: string;
  nation: string;
  flag: string;
  tournament: string;
  format: TournamentFormat;
  year: number;
  players: Player[];
}

export interface FormationSlot {
  role: Role;
  index: number;
}

export interface Formation {
  id: string;
  label: string;
  slots: FormationSlot[];
}

export interface DraftedPlayer extends Player {
  slotIndex: number;
  squadNation: string;
  squadYear: number;
  squadTournament: string;
}

export interface DrawState {
  squad: Squad;
  rerollsLeft: number;
}

export interface PlayerInnings {
  name: string;
  runs: number;
  balls: number;
  wickets: number;
  runsConceded: number;
  slotIndex: number;
}

export interface MatchResult {
  match: number;
  opponent: string;
  result: 'win' | 'loss' | 'tie';
  ourScore: number;
  ourWickets: number;
  oppScore: number;
  oppWickets: number;
  margin: string;
  topScorer: { name: string; runs: number; balls: number };
  topBowler: { name: string; wickets: number; runs: number };
  playerStats: PlayerInnings[];
}

export interface TournamentPlayerStats {
  player: DraftedPlayer;
  totalRuns: number;
  totalBalls: number;
  totalWickets: number;
  totalRunsConceded: number;
  matchesPlayed: number;
  fifties: number;
  bestBowling: string;
  impactScore: number;
}

export interface SimulationResult {
  totalMatches: number;
  matches: MatchResult[];
  lineup: DraftedPlayer[];
  wins: number;
  losses: number;
  ties: number;
  rating: number;
  balance: number;
  batting: number;
  bowling: number;
  runsFor: number;
  runsAgainst: number;
  wicketsTaken: number;
  wicketsLost: number;
  headline: string;
  subheadline: string;
  story: string;
  badge: string;
  seed: string;
  playerTotals: TournamentPlayerStats[];
  manOfTheSeries: TournamentPlayerStats;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  style: PlayStyle;
  formationId: string;
  lineup: (DraftedPlayer | null)[];
  draw: DrawState | null;
  selectedPlayer: Player | null;
  picksMade: number;
  simulation: SimulationResult | null;
}
