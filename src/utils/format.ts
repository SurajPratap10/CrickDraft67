import type { Role, TournamentFormat } from '../types';

export const MATCH_COUNTS: Record<TournamentFormat, number> = {
  odi: 7,
  t20: 6,
};

export function getMatchCount(format: TournamentFormat): number {
  return MATCH_COUNTS[format];
}

export function getPerfectRunRecord(format: TournamentFormat): string {
  return `${getMatchCount(format)}-0`;
}

export function getRoadToHeadline(format: TournamentFormat): string {
  return `Road to ${getPerfectRunRecord(format)}`;
}

export function getFormatShortLabel(format: TournamentFormat): string {
  return format === 't20' ? 'T20' : 'ODI';
}

export function getWinTargetLabel(format: TournamentFormat): string {
  const count = getMatchCount(format);
  return `Win ${count} matches in a row`;
}

export function getKnockoutCopy(format: TournamentFormat): string {
  const count = getMatchCount(format);
  const label = getFormatShortLabel(format);
  return `${label} knockout · ${count} matches to win · chase ${count}-0`;
}

const NATION_CODES: Record<string, string> = {
  India: 'IND',
  Australia: 'AUS',
  England: 'ENG',
  Pakistan: 'PAK',
  'South Africa': 'RSA',
  'West Indies': 'WI',
  'New Zealand': 'NZ',
  'Sri Lanka': 'SL',
  Bangladesh: 'BAN',
  Afghanistan: 'AFG',
  Zimbabwe: 'ZIM',
  Ireland: 'IRE',
  Netherlands: 'NED',
};

export function nationCode(nation: string): string {
  return NATION_CODES[nation] ?? nation.slice(0, 3).toUpperCase();
}

export function shortName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return name;
  return parts[parts.length - 1];
}

/** Player role label — bowlers split into fast vs spinner */
export function formatRole(role: Role): string {
  switch (role) {
    case 'BWL':
      return 'BWL (fast)';
    case 'SP':
      return 'BWL (spinner)';
    default:
      return role;
  }
}

export function formatRoles(roles: Role[]): string {
  return roles.map(formatRole).join('/');
}

/** Field slot label — all bowler slots show as BWL */
export function formatSlotRole(role: Role): string {
  if (role === 'BWL' || role === 'SP') return 'BWL';
  return role;
}
