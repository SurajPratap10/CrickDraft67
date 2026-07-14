import type { DraftedPlayer, Player, Role, Squad } from '../types';
import { canPlayerFillRole, getFormation } from './gameLogic';

const FILLER_NAMES = [
  'Filler A', 'Filler B', 'Filler C', 'Filler D', 'Filler E',
  'Filler F', 'Filler G', 'Filler H', 'Filler I',
];

function makeFiller(name: string, role: Role, slotIndex: number): Player {
  return {
    id: `debug-${name.toLowerCase().replace(/\s+/g, '-')}-${slotIndex}`,
    number: 90 + slotIndex,
    name,
    roles: [role],
    rating: 62,
  };
}

function pickPoolPlayer(
  pool: Player[],
  role: Role,
  used: Set<string>,
): Player | null {
  const match = pool.find((player) => !used.has(player.id) && canPlayerFillRole(player, role));
  if (match) return match;
  return null;
}

/** DEBUG ONLY — build a full XI from 2 hand-picked players + squad fillers */
export function buildDebugLineup(
  formationId: string,
  squad: Squad,
  picked: [Player, Player],
): DraftedPlayer[] {
  const formation = getFormation(formationId);
  const used = new Set<string>(picked.map((player) => player.id));
  const pool = squad.players.filter((player) => !used.has(player.id));
  let fillerIndex = 0;
  const unplaced = [...picked];

  return formation.slots.map((slot, slotIndex) => {
    const fromPicked = unplaced.findIndex((player) => canPlayerFillRole(player, slot.role));
    if (fromPicked !== -1) {
      const player = unplaced.splice(fromPicked, 1)[0];
      used.add(player.id);
      return toDrafted(player, slotIndex, squad);
    }

    const fromPool = pickPoolPlayer(pool, slot.role, used);
    if (fromPool) {
      used.add(fromPool.id);
      return toDrafted(fromPool, slotIndex, squad);
    }

    const filler = makeFiller(FILLER_NAMES[fillerIndex++] ?? `Filler ${slotIndex}`, slot.role, slotIndex);
    return toDrafted(filler, slotIndex, squad);
  });
}

function toDrafted(
  player: Player,
  slotIndex: number,
  squad: Squad,
): DraftedPlayer {
  return {
    ...player,
    slotIndex,
    squadNation: squad.nation,
    squadYear: squad.year,
    squadTournament: squad.tournament,
  };
}
