import type { GameMode, SimulationResult, TournamentFormat } from '../types';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  formation: string;
  mode: GameMode;
  format: TournamentFormat;
  wins: number;
  losses: number;
  ties: number;
  runsFor: number;
  runsAgainst: number;
  runDiff: number;
  rating: number;
  seed: string;
  motm: string;
  createdAt: string;
}

export interface PerfectRunMeta {
  formation: string;
  mode: GameMode;
  format: TournamentFormat;
}

const STORAGE_KEY = 'cric11:leaderboard:24h';
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 100;
export const LEADERBOARD_REFRESH_EVENT = 'cric11:leaderboard:refresh';

export function isPerfectRun(result: SimulationResult): boolean {
  return (
    result.wins === result.totalMatches &&
    result.losses === 0 &&
    result.ties === 0 &&
    result.matches.length === result.totalMatches
  );
}

export function isKnockedOut(result: SimulationResult): boolean {
  return result.losses > 0 && result.matches.length < result.totalMatches;
}

function readRaw(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: LeaderboardEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(LEADERBOARD_REFRESH_EVENT));
}

export function pruneExpired(entries: LeaderboardEntry[], now = Date.now()): LeaderboardEntry[] {
  return entries.filter((entry) => now - new Date(entry.createdAt).getTime() < TTL_MS);
}

export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (b.runDiff !== a.runDiff) return b.runDiff - a.runDiff;
  if (b.runsFor !== a.runsFor) return b.runsFor - a.runsFor;
  if (a.runsAgainst !== b.runsAgainst) return a.runsAgainst - b.runsAgainst;
  if (b.rating !== a.rating) return b.rating - a.rating;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(compareEntries);
}

export function getLeaderboard(): LeaderboardEntry[] {
  const fresh = pruneExpired(readRaw());
  if (fresh.length !== readRaw().length) write(fresh);
  return sortEntries(fresh);
}

export function getEntryRank(id: string, entries = getLeaderboard()): number {
  const index = entries.findIndex((entry) => entry.id === id);
  return index === -1 ? 0 : index + 1;
}

export function savePerfectRun(
  result: SimulationResult,
  meta: PerfectRunMeta,
  displayName: string,
): LeaderboardEntry {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error('Display name is required for leaderboard submission.');
  }

  const now = Date.now();
  const existing = pruneExpired(readRaw(), now);
  const runDiff = result.runsFor - result.runsAgainst;

  const duplicate = existing.find((entry) => entry.seed === result.seed);
  if (duplicate) {
    const updated: LeaderboardEntry = {
      ...duplicate,
      displayName: trimmed,
      formation: meta.formation,
      mode: meta.mode,
      format: meta.format,
      wins: result.wins,
      losses: result.losses,
      ties: result.ties,
      runsFor: result.runsFor,
      runsAgainst: result.runsAgainst,
      runDiff,
      rating: result.rating,
      motm: result.manOfTheSeries.player.name,
      createdAt: duplicate.createdAt,
    };

    const next = sortEntries(
      existing.map((entry) => (entry.id === duplicate.id ? updated : entry)),
    ).slice(0, MAX_ENTRIES);
    write(next);
    return updated;
  }

  const entry: LeaderboardEntry = {
    id: crypto.randomUUID(),
    displayName: trimmed,
    formation: meta.formation,
    mode: meta.mode,
    format: meta.format,
    wins: result.wins,
    losses: result.losses,
    ties: result.ties,
    runsFor: result.runsFor,
    runsAgainst: result.runsAgainst,
    runDiff,
    rating: result.rating,
    seed: result.seed,
    motm: result.manOfTheSeries.player.name,
    createdAt: new Date().toISOString(),
  };

  const next = sortEntries([...existing, entry]).slice(0, MAX_ENTRIES);
  write(next);
  return entry;
}

export function updateEntryName(id: string, displayName: string): LeaderboardEntry | null {
  const trimmed = displayName.trim();
  if (!trimmed) return null;

  const existing = pruneExpired(readRaw());
  const target = existing.find((entry) => entry.id === id);
  if (!target) return null;

  const updated = { ...target, displayName: trimmed };
  const next = sortEntries(existing.map((entry) => (entry.id === id ? updated : entry)));
  write(next);
  return updated;
}

export function getNextExpiryMs(entries = getLeaderboard()): number | null {
  if (entries.length === 0) return null;
  const now = Date.now();
  const oldest = entries.reduce((min, entry) => {
    const ts = new Date(entry.createdAt).getTime();
    return ts < min ? ts : min;
  }, now);
  return Math.max(0, oldest + TTL_MS - now);
}
