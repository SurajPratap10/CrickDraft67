import { FORMATIONS } from '../data/formations';
import type { DraftedPlayer, Formation, Player, Role, Squad } from '../types';

const BOWLER_ROLES: Role[] = ['BWL', 'SP'];

export function getFormation(id: string): Formation {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[0];
}

/** Strict for batters/all-rounders; BWL + SP slots accept any bowler (pace or spin). */
export function canPlayerFillRole(player: Player, role: Role): boolean {
  if (role === 'BWL' || role === 'SP') {
    return player.roles.some((playerRole) => BOWLER_ROLES.includes(playerRole));
  }
  return player.roles.includes(role);
}

export function isBowlerRole(role: Role): boolean {
  return role === 'BWL' || role === 'SP';
}

export function getOpenSlots(
  formation: Formation,
  lineup: (DraftedPlayer | null)[],
): number[] {
  return formation.slots
    .map((_, i) => i)
    .filter((i) => lineup[i] === null);
}

export function getValidSlotsForPlayer(
  player: Player,
  formation: Formation,
  lineup: (DraftedPlayer | null)[],
): number[] {
  return getOpenSlots(formation, lineup).filter((i) =>
    canPlayerFillRole(player, formation.slots[i].role),
  );
}

export function isLineupComplete(lineup: (DraftedPlayer | null)[]): boolean {
  return lineup.every((slot) => slot !== null);
}

export function assignPlayer(
  player: Player,
  slotIndex: number,
  squad: Squad,
  lineup: (DraftedPlayer | null)[],
): (DraftedPlayer | null)[] {
  const next = [...lineup];
  next[slotIndex] = {
    ...player,
    slotIndex,
    squadNation: squad.nation,
    squadYear: squad.year,
    squadTournament: squad.tournament,
  };
  return next;
}

export function getRoleStrength(lineup: DraftedPlayer[], role: Role): number {
  const players = lineup.filter((p) => p && canPlayerFillRole(p, role));
  if (players.length === 0) return 0;
  return players.reduce((sum, p) => sum + p!.rating, 0) / players.length;
}

export function getLineupAverage(lineup: DraftedPlayer[]): number {
  if (lineup.length === 0) return 0;
  return lineup.reduce((sum, p) => sum + p.rating, 0) / lineup.length;
}

export function shufflePlayersForDisplay(players: Player[], seed: string): Player[] {
  const arr = [...players];
  let state = hashSeed(seed) || 1;

  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/** Top 2 rated players in the drawn squad — golden highlight, any list position */
export function getSquadStarPlayerIds(players: Player[]): Set<string> {
  const sorted = [...players].sort(
    (a, b) => b.rating - a.rating || a.name.localeCompare(b.name),
  );
  return new Set(sorted.slice(0, 2).map((player) => player.id));
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** @deprecated Use shufflePlayersForDisplay — kept for compatibility */
export function sortPlayersForDisplay(players: Player[]): Player[] {
  return shufflePlayersForDisplay(players, 'fallback');
}

/** Canonical key — same cricketer cannot be drafted twice across squads */
export function playerKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getDraftedPlayerKeys(lineup: (DraftedPlayer | null)[]): Set<string> {
  const keys = new Set<string>();
  for (const slot of lineup) {
    if (slot) keys.add(playerKey(slot.name));
  }
  return keys;
}

export const OPPONENTS = [
  'Australia', 'India', 'England', 'Pakistan', 'South Africa',
  'New Zealand', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan',
  'Zimbabwe', 'Ireland', 'Netherlands', 'Scotland', 'Namibia',
];
