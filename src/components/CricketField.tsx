import { FIELD_POSITIONS } from '../data/formations';
import type { DraftedPlayer, Formation, Player } from '../types';
import { formatSlotRole } from '../utils/format';

interface CricketFieldProps {
  formation: Formation;
  lineup: (DraftedPlayer | null)[];
  selectedPlayer: Player | null;
  validSlots: number[];
  onSlotClick: (index: number) => void;
}

export function CricketField({
  formation,
  lineup,
  selectedPlayer,
  validSlots,
  onSlotClick,
}: CricketFieldProps) {
  return (
    <div className="field-wrap">
      <div className="field-stage">
        <div className="cricket-oval" aria-label="Cricket field lineup">
          <div className="field-pitch-strip" aria-hidden="true" />
          {formation.slots.map((slot, index) => {
            const player = lineup[index];
            const pos = FIELD_POSITIONS[String(index)];
            const isValid = validSlots.includes(index);
            const isFilled = player !== null;

          const slotLabel = formatSlotRole(slot.role);

          return (
            <button
              key={index}
              type="button"
              className={[
                'slot-btn',
                isFilled ? 'filled' : 'empty',
                selectedPlayer && isValid ? 'highlight' : '',
              ].filter(Boolean).join(' ')}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => onSlotClick(index)}
              disabled={!selectedPlayer && !isFilled}
              aria-label={
                isFilled
                  ? `${slotLabel}: ${player!.name} from ${player!.squadNation} ${player!.squadYear}`
                  : `Empty ${slotLabel} slot`
              }
            >
              {isFilled ? (
                <>
                  <span className="slot-role">{slotLabel}</span>
                  <span className="slot-name">{player!.name.split(' ').pop()}</span>
                  <span className="slot-meta">{player!.rating}</span>
                </>
              ) : (
                <>
                  <span className="slot-order">{index + 1}</span>
                  <span className="slot-role">{slotLabel}</span>
                </>
              )}
              </button>
            );
          })}
        </div>
      </div>
      {selectedPlayer && (
        <p className="assign-hint">
          Assign <strong>{selectedPlayer.name}</strong> to a highlighted slot
        </p>
      )}
    </div>
  );
}
