import type {
  DraftedPlayer,
  MatchResult,
  PlayerInnings,
  PlayStyle,
  SimulationResult,
  TournamentFormat,
  TournamentPlayerStats,
} from '../types';
import { getMatchCount } from './format';
import { OPPONENTS } from './gameLogic';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashLineup(lineup: DraftedPlayer[]): number {
  return lineup.reduce((h, p) => h + p.rating * p.number + p.slotIndex * 7, 42);
}

function generateSeed(lineup: DraftedPlayer[]): string {
  const h = hashLineup(lineup).toString(36).toUpperCase();
  return h.slice(0, 7).padStart(7, '0');
}

function isBatter(p: DraftedPlayer): boolean {
  return p.roles.some((r) => ['OP', 'MO', 'WK', 'AR'].includes(r));
}

function isBowler(p: DraftedPlayer): boolean {
  return p.roles.some((r) => ['BWL', 'SP', 'AR'].includes(r));
}

function getBattingScore(lineup: DraftedPlayer[]): number {
  const batters = lineup.filter(isBatter);
  return batters.reduce((s, p) => s + p.rating, 0) / batters.length;
}

function getBowlingScore(lineup: DraftedPlayer[]): number {
  const bowlers = lineup.filter(isBowler);
  return bowlers.reduce((s, p) => s + p.rating, 0) / bowlers.length;
}

function getBalanceScore(lineup: DraftedPlayer[]): number {
  const batting = getBattingScore(lineup);
  const bowling = getBowlingScore(lineup);
  return Math.max(0, 100 - Math.abs(batting - bowling) * 2);
}

function styleModifier(style: PlayStyle): { bat: number; bowl: number; luck: number } {
  switch (style) {
    case 'defensive':
      return { bat: -3, bowl: 5, luck: 0 };
    case 'attacking':
      return { bat: 6, bowl: -2, luck: -2 };
    default:
      return { bat: 0, bowl: 0, luck: 0 };
  }
}

function batterWeight(p: DraftedPlayer): number {
  if (p.roles.includes('OP')) return 1.15;
  if (p.roles.includes('MO')) return 1.05;
  if (p.roles.includes('WK')) return 0.85;
  if (p.roles.includes('AR')) return 0.95;
  return 0.5;
}

function bowlerWeight(p: DraftedPlayer): number {
  if (p.roles.includes('BWL')) return 1.2;
  if (p.roles.includes('SP')) return 1.1;
  if (p.roles.includes('AR')) return 0.9;
  return 0.3;
}

function generatePlayerInnings(
  lineup: DraftedPlayer[],
  teamTotal: number,
  teamWickets: number,
  isWin: boolean,
  rand: () => number,
): PlayerInnings[] {
  const batters = lineup.filter(isBatter);
  const bowlers = lineup.filter(isBowler);
  const stats: PlayerInnings[] = lineup.map((p) => ({
    name: p.name,
    runs: 0,
    balls: 0,
    wickets: 0,
    runsConceded: 0,
    slotIndex: p.slotIndex,
  }));

  const byName = new Map(stats.map((s) => [s.name, s]));
  let runsLeft = teamTotal;
  const battingOrder = [...batters].sort((a, b) => a.slotIndex - b.slotIndex);

  for (let i = 0; i < battingOrder.length && runsLeft > 0; i++) {
    const p = battingOrder[i];
    const s = byName.get(p.name)!;
    const isLast = i === battingOrder.length - 1;
    const share = batterWeight(p) * (p.rating / 85);
    const portion = isLast
      ? runsLeft
      : Math.min(runsLeft, Math.floor((teamTotal / battingOrder.length) * share * (0.7 + rand() * 0.8)));
    s.runs = Math.max(0, portion);
    s.balls = Math.max(1, Math.floor(s.runs * (1.1 + rand() * 0.6)));
    runsLeft -= s.runs;
  }
  if (runsLeft > 0 && battingOrder[0]) {
    byName.get(battingOrder[0].name)!.runs += runsLeft;
  }

  const totalWickets = Math.min(teamWickets, lineup.length - 1);
  let wktsLeft = totalWickets;
  for (const p of battingOrder) {
    if (wktsLeft <= 0) break;
    if (rand() > 0.55) {
      const s = byName.get(p.name)!;
      if (s.runs > 0) wktsLeft--;
    }
  }

  const totalOppRuns = Math.floor(120 + rand() * 100);
  let wktsToAssign = isWin ? Math.floor(2 + rand() * 4) : Math.floor(1 + rand() * 3);
  const bowlShares = bowlers.map((p) => bowlerWeight(p) * p.rating);
  const bowlSum = bowlShares.reduce((a, b) => a + b, 0) || 1;

  for (const p of bowlers) {
    const s = byName.get(p.name)!;
    const share = (bowlerWeight(p) * p.rating) / bowlSum;
    s.wickets = wktsToAssign > 0 ? Math.max(0, Math.round(share * wktsToAssign * (0.6 + rand() * 0.8))) : 0;
    s.runsConceded = Math.floor(totalOppRuns * share * (0.5 + rand() * 0.5));
    wktsToAssign -= s.wickets;
  }

  return stats;
}

function getTopScorer(stats: PlayerInnings[]) {
  const best = [...stats].sort((a, b) => b.runs - a.runs)[0];
  return { name: best.name, runs: best.runs, balls: best.balls };
}

function getTopBowler(stats: PlayerInnings[]) {
  const bowlers = stats.filter((s) => s.wickets > 0);
  if (bowlers.length === 0) return { name: stats[0].name, wickets: 0, runs: 0 };
  const best = [...bowlers].sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded)[0];
  return { name: best.name, wickets: best.wickets, runs: best.runsConceded };
}

function generateMargin(
  result: 'win' | 'loss' | 'tie',
  ourScore: number,
  oppScore: number,
  rand: () => number,
): string {
  if (result === 'tie') return 'Match tied';
  const diff = Math.abs(ourScore - oppScore);
  if (result === 'win') {
    if (diff < 20) return `${Math.floor(1 + rand() * 4)} wickets`;
    return `${diff} runs`;
  }
  if (diff < 20) return `${Math.floor(1 + rand() * 4)} wickets`;
  return `${diff} runs`;
}

function buildPlayerTotals(
  lineup: DraftedPlayer[],
  matches: MatchResult[],
): TournamentPlayerStats[] {
  const map = new Map<string, TournamentPlayerStats>();

  for (const p of lineup) {
    map.set(p.name, {
      player: p,
      totalRuns: 0,
      totalBalls: 0,
      totalWickets: 0,
      totalRunsConceded: 0,
      matchesPlayed: 0,
      fifties: 0,
      bestBowling: '0/0',
      impactScore: 0,
    });
  }

  for (const m of matches) {
    for (const s of m.playerStats) {
      const t = map.get(s.name);
      if (!t) continue;
      t.matchesPlayed++;
      t.totalRuns += s.runs;
      t.totalBalls += s.balls;
      t.totalWickets += s.wickets;
      t.totalRunsConceded += s.runsConceded;
      if (s.runs >= 50) t.fifties++;
      const bowling = `${s.wickets}/${s.runsConceded}`;
      const [bw, br] = t.bestBowling.split('/').map(Number);
      if (s.wickets > bw || (s.wickets === bw && s.runsConceded < br)) {
        t.bestBowling = bowling;
      }
    }
  }

  const totals = [...map.values()];
  for (const t of totals) {
    t.impactScore = Math.round(
      t.totalRuns * 1.2 + t.totalWickets * 25 + t.fifties * 15 - t.totalRunsConceded * 0.05,
    );
  }
  return totals.sort((a, b) => b.impactScore - a.impactScore);
}

function getBadge(wins: number, totalMatches: number, knockedOut: boolean): string {
  if (wins === totalMatches && !knockedOut) return '★ RECORD BREAKER';
  if (wins >= totalMatches - 1 && !knockedOut) return '★ CHAMPION';
  if (wins >= Math.ceil(totalMatches * 0.7) && !knockedOut) return '★ CONTENDER';
  if (wins >= Math.ceil(totalMatches * 0.5)) return '★ FIGHTER';
  return '★ CAMPAIGN';
}

function getHeadline(
  wins: number,
  losses: number,
  ties: number,
  matchesPlayed: number,
  totalMatches: number,
): string {
  const knockedOut = losses > 0 && matchesPlayed < totalMatches;
  if (knockedOut) {
    if (wins >= totalMatches - 2) return 'SEMIFINAL EXIT';
    if (wins >= Math.ceil(totalMatches * 0.5)) return 'QUARTERFINAL EXIT';
    if (wins >= 3) return 'KNOCKED OUT';
    if (wins >= 1) return 'ELIMINATED';
    return 'FIRST ROUND EXIT';
  }
  if (wins === totalMatches) return 'CHAMPION';
  if (wins >= totalMatches - 1) return 'CHAMPION';
  if (wins >= Math.ceil(totalMatches * 0.7)) return 'SEMIFINALIST';
  if (wins >= Math.ceil(totalMatches * 0.5)) return 'MIXED RUN';
  if (wins >= 3) return 'EARLY EXIT';
  if (ties >= 3) return 'RAIN CHAOS';
  return 'GROUP EXIT';
}

function getSubheadline(
  wins: number,
  losses: number,
  matchesPlayed: number,
  totalMatches: number,
): string {
  const knockedOut = losses > 0 && matchesPlayed < totalMatches;
  if (knockedOut) {
    return `KNOCKED OUT · MATCH ${matchesPlayed} · ${wins}W · ${losses}L`;
  }
  if (wins === totalMatches) return 'PERFECT CAMPAIGN · UNBEATEN';
  if (wins >= totalMatches - 1) return `${wins}W · ${losses}L · DOMINANT RUN`;
  if (wins >= Math.ceil(totalMatches * 0.7)) return `${wins}W · ${losses}L · STRONG CAMPAIGN`;
  return `${wins}W · ${losses}L · TOURNAMENT COMPLETE`;
}

function getStory(
  wins: number,
  losses: number,
  matchesPlayed: number,
  totalMatches: number,
  balance: number,
  batting: number,
  bowling: number,
): string {
  const parts: string[] = [];
  const knockedOut = losses > 0 && matchesPlayed < totalMatches;

  if (knockedOut) {
    parts.push(
      `Knockout ended the run in match ${matchesPlayed}. One defeat — and the World Cup dream was over.`,
    );
  } else if (wins === totalMatches) {
    parts.push(
      `An unbeaten ${totalMatches}-match World Cup run. Every innings clicked, every spell landed.`,
    );
  } else if (wins >= Math.ceil(totalMatches * 0.7)) {
    parts.push('A deep campaign built on smart draft picks and balanced roles.');
  } else {
    parts.push('Famous names were not enough when the XI needed spine and balance.');
  }

  if (balance >= 85) parts.push('Batting and bowling were beautifully balanced.');
  if (batting >= 85) parts.push('The batting unit set platforms and finished strong.');
  if (bowling >= 85) parts.push('The attack took wickets at key moments.');
  if (!knockedOut && losses >= Math.ceil(totalMatches * 0.5)) {
    parts.push(`${losses} defeats exposed the weak picks.`);
  }
  return parts.join(' ');
}

export function simulateTournament(
  lineup: DraftedPlayer[],
  style: PlayStyle,
  format: TournamentFormat,
): SimulationResult {
  const totalMatches = getMatchCount(format);
  const rand = seededRandom(hashLineup(lineup));
  const mod = styleModifier(style);
  const batting = getBattingScore(lineup) + mod.bat;
  const bowling = getBowlingScore(lineup) + mod.bowl;
  const balance = getBalanceScore(lineup);
  const teamStrength = batting * 0.45 + bowling * 0.4 + balance * 0.15 + mod.luck;

  const matches: MatchResult[] = [];
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let runsFor = 0;
  let runsAgainst = 0;
  let wicketsTaken = 0;
  let wicketsLost = 0;

  const usedOpponents = new Set<string>();

  for (let i = 1; i <= totalMatches; i++) {
    let opponent = OPPONENTS[Math.floor(rand() * OPPONENTS.length)];
    while (usedOpponents.has(opponent) && usedOpponents.size < OPPONENTS.length) {
      opponent = OPPONENTS[Math.floor(rand() * OPPONENTS.length)];
    }
    usedOpponents.add(opponent);

    const opponentStrength = 72 + rand() * 22;
    const luck = (rand() - 0.5) * 12;
    const performance = teamStrength + luck;
    const diff = performance - opponentStrength;

    let result: 'win' | 'loss' | 'tie';
    if (Math.abs(diff) < 2 && rand() > 0.7) {
      result = 'tie';
      ties++;
    } else if (diff >= 0) {
      result = 'win';
      wins++;
    } else {
      result = 'loss';
      losses++;
    }

    const isWin = result === 'win';
    const ourScore = Math.floor(130 + performance * 0.9 + rand() * 70);
    const oppScore = Math.floor(
      result === 'tie'
        ? ourScore
        : isWin
          ? ourScore - Math.floor(10 + rand() * 80)
          : ourScore + Math.floor(10 + rand() * 60),
    );
    const ourWickets = isWin
      ? Math.floor(3 + rand() * 5)
      : Math.floor(6 + rand() * 4);
    const oppWickets = isWin
      ? Math.floor(6 + rand() * 4)
      : Math.floor(3 + rand() * 5);

    const playerStats = generatePlayerInnings(lineup, ourScore, ourWickets, isWin, rand);

    runsFor += ourScore;
    runsAgainst += oppScore;
    wicketsTaken += playerStats.reduce((s, p) => s + p.wickets, 0);
    wicketsLost += ourWickets;

    matches.push({
      match: i,
      opponent,
      result,
      ourScore,
      ourWickets,
      oppScore,
      oppWickets,
      margin: generateMargin(result, ourScore, oppScore, rand),
      topScorer: getTopScorer(playerStats),
      topBowler: getTopBowler(playerStats),
      playerStats,
    });

    if (result === 'loss') break;
  }

  const matchesPlayed = matches.length;
  const knockedOut = losses > 0 && matchesPlayed < totalMatches;
  const playerTotals = buildPlayerTotals(lineup, matches);
  const manOfTheSeries = playerTotals[0];

  return {
    totalMatches,
    matches,
    lineup,
    wins,
    losses,
    ties,
    rating: Math.round(teamStrength),
    balance: Math.round(balance),
    batting: Math.round(batting),
    bowling: Math.round(bowling),
    runsFor,
    runsAgainst,
    wicketsTaken,
    wicketsLost,
    headline: getHeadline(wins, losses, ties, matchesPlayed, totalMatches),
    story: getStory(wins, losses, matchesPlayed, totalMatches, balance, batting, bowling),
    badge: getBadge(wins, totalMatches, knockedOut),
    seed: generateSeed(lineup),
    playerTotals,
    manOfTheSeries,
    subheadline: getSubheadline(wins, losses, matchesPlayed, totalMatches),
  };
}
