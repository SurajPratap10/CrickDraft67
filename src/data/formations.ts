import type { Formation, PlayStyle, Role } from '../types';

const slots = (...roles: Role[]) =>
  roles.map((role, index) => ({ role, index }));

export const FORMATIONS: Formation[] = [
  { id: '1-2-3-2-3', label: '1-2-3-2-3', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'MO', 'AR', 'AR', 'BWL', 'BWL', 'BWL') },
  { id: '1-2-4-2-2', label: '1-2-4-2-2', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'MO', 'MO', 'AR', 'AR', 'BWL', 'BWL') },
  { id: '1-2-2-4-2', label: '1-2-2-4-2', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'AR', 'AR', 'AR', 'AR', 'BWL', 'BWL') },
  { id: '1-2-3-1-4', label: '1-2-3-1-4', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'MO', 'AR', 'BWL', 'BWL', 'BWL', 'BWL') },
  { id: '1-3-2-2-3', label: '1-3-2-2-3', slots: slots('WK', 'OP', 'OP', 'OP', 'MO', 'MO', 'AR', 'AR', 'BWL', 'BWL', 'BWL') },
  { id: '1-2-2-3-3', label: '1-2-2-3-3', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'AR', 'AR', 'AR', 'BWL', 'BWL', 'BWL') },
  { id: '1-2-4-1-3', label: '1-2-4-1-3', slots: slots('WK', 'OP', 'OP', 'MO', 'MO', 'MO', 'MO', 'AR', 'BWL', 'BWL', 'BWL') },
  { id: '1-3-3-1-3', label: '1-3-3-1-3', slots: slots('WK', 'OP', 'OP', 'OP', 'MO', 'MO', 'MO', 'AR', 'BWL', 'BWL', 'BWL') },
];

export const DEFAULT_FORMATION = '1-2-3-2-3';

/** Recommended field setting per play style */
export const STYLE_FIELD_SETTINGS: Record<PlayStyle, string> = {
  defensive: '1-2-3-1-4',
  balanced: '1-2-3-2-3',
  attacking: '1-2-4-2-2',
};

export const STYLE_FIELD_HINTS: Record<PlayStyle, string> = {
  defensive: 'Bowling-heavy field — 1-2-3-1-4 with four bowler slots.',
  balanced: 'Balanced field — 1-2-3-2-3 for even bat and ball.',
  attacking: 'Batting-heavy field — 1-2-4-2-2 with four middle-order slots.',
};

export function getFormationForStyle(style: PlayStyle): string {
  return STYLE_FIELD_SETTINGS[style];
}

export const FIELD_POSITIONS: Record<string, { top: string; left: string }> = {
  '0': { top: '82%', left: '50%' },
  '1': { top: '68%', left: '28%' },
  '2': { top: '68%', left: '72%' },
  '3': { top: '54%', left: '18%' },
  '4': { top: '54%', left: '50%' },
  '5': { top: '54%', left: '82%' },
  '6': { top: '38%', left: '30%' },
  '7': { top: '38%', left: '70%' },
  '8': { top: '22%', left: '20%' },
  '9': { top: '22%', left: '50%' },
  '10': { top: '22%', left: '80%' },
};
