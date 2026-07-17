import type { Player, Role } from '../types';

function batterWeight(roles: Role[]): number {
  if (roles.includes('OP')) return 1.15;
  if (roles.includes('MO')) return 1.05;
  if (roles.includes('WK')) return 0.85;
  if (roles.includes('AR')) return 0.95;
  return 0.45;
}

function bowlerWeight(roles: Role[]): number {
  if (roles.includes('BWL')) return 1.2;
  if (roles.includes('SP')) return 1.1;
  if (roles.includes('AR')) return 0.9;
  return 0.3;
}

function clampStat(value: number): number {
  return Math.max(28, Math.min(99, Math.round(value)));
}

export function getPlayerBattingStat(player: Player): number {
  return clampStat(player.rating * batterWeight(player.roles));
}

export function getPlayerBowlingStat(player: Player): number {
  return clampStat(player.rating * bowlerWeight(player.roles));
}

export function getPlayerImpactStat(player: Player): number {
  const bat = getPlayerBattingStat(player);
  const bowl = getPlayerBowlingStat(player);
  if (player.roles.includes('AR')) {
    return clampStat((bat + bowl) / 2 + 2);
  }
  return clampStat(Math.max(bat, bowl));
}

export function getPlayerPrimaryLabel(player: Player): string {
  if (player.roles.includes('WK')) return 'Wicketkeeper';
  if (player.roles.includes('OP')) return 'Opener';
  if (player.roles.includes('MO')) return 'Middle order';
  if (player.roles.includes('AR')) return 'All-rounder';
  if (player.roles.includes('SP')) return 'Spinner';
  if (player.roles.includes('BWL')) return 'Fast bowler';
  return 'Squad player';
}

export function getPlayerFlexLabel(roles: Role[]): string {
  if (roles.length >= 3) return 'Very flexible';
  if (roles.length === 2) return 'Dual role';
  return 'Specialist';
}
