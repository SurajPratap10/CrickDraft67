import { useMemo, useState } from 'react';
import type { GameMode, PlayStyle, TournamentFormat } from '../types';
import { FORMAT_LABELS, getRandomSquad } from '../data/squads';
import type { Player, Squad } from '../types';
import { buildDebugLineup } from '../utils/debugLineup';
import { formatRoles } from '../utils/format';
import { getSquadStarPlayerIds, shufflePlayersForDisplay } from '../utils/gameLogic';

interface DebugSimPanelProps {
  tournamentFormat: TournamentFormat;
  mode: GameMode;
  style: PlayStyle;
  formationId: string;
  onStartSimulation: (lineup: ReturnType<typeof buildDebugLineup>) => void;
}

export function DebugSimPanel({
  tournamentFormat,
  mode,
  style,
  formationId,
  onStartSimulation,
}: DebugSimPanelProps) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [selected, setSelected] = useState<Player[]>([]);

  const players = useMemo(
    () => (squad ? shufflePlayersForDisplay(squad.players, `${squad.id}-debug`) : []),
    [squad],
  );

  const starIds = useMemo(
    () => (squad ? getSquadStarPlayerIds(squad.players) : new Set<string>()),
    [squad],
  );

  const canStart = selected.length === 2;

  const handleRoll = () => {
    const next = getRandomSquad(tournamentFormat);
    setSquad(next);
    setSelected([]);
  };

  const togglePlayer = (player: Player) => {
    setSelected((prev) => {
      if (prev.some((p) => p.id === player.id)) {
        return prev.filter((p) => p.id !== player.id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, player];
    });
  };

  const handleStart = () => {
    if (!squad || selected.length !== 2) return;
    const lineup = buildDebugLineup(formationId, squad, [selected[0], selected[1]]);
    onStartSimulation(lineup);
  };

  return (
    <div className="debug-panel">
      <div className="debug-banner">
        <p className="debug-banner-label">Debug mode</p>
        <p className="debug-banner-copy">
          Pick 2 players, auto-fill the rest, then run the full knockout sim + animations.
          Remove before launch.
        </p>
      </div>

      {!squad ? (
        <div className="roll-zone">
          <p>Roll a {FORMAT_LABELS[tournamentFormat]} squad for debug picks</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={handleRoll}>
            Roll squad 🎲
          </button>
        </div>
      ) : (
        <>
          <div className="draw-card">
            <p className="draw-label">Debug squad</p>
            <div className="draw-nation">
              <span className="draw-flag">{squad.flag}</span>
              <span>{squad.nation}</span>
            </div>
            <p className="draw-tournament">
              {squad.tournament} {squad.year}
            </p>
          </div>

          <div className="pool-header">
            <p className="control-label">Pick 2 players ({selected.length}/2)</p>
            <button type="button" className="btn btn-secondary" onClick={handleRoll}>
              ↺ Reroll squad
            </button>
          </div>

          <div className="pool-list debug-pool-list">
            {players.map((player) => {
              const isSelected = selected.some((p) => p.id === player.id);
              const isStar = starIds.has(player.id);
              const disabled = !isSelected && selected.length >= 2;

              return (
                <button
                  key={player.id}
                  type="button"
                  className={[
                    'pool-row',
                    isSelected ? 'is-selected' : '',
                    isStar ? 'pool-row--star' : '',
                    disabled ? 'pool-row--no-slot' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !disabled && togglePlayer(player)}
                  disabled={disabled}
                >
                  <span className="pool-num">#{player.number}</span>
                  <span className="pool-name">{player.name}</span>
                  <span className="pool-role">{formatRoles(player.roles)}</span>
                  {isSelected && <span className="pool-badge">Picked</span>}
                  {isStar && mode === 'classic' && <span className="pool-badge pool-badge--star">★ Star</span>}
                  <span className={`pool-rating ${mode === 'almanac' ? 'hidden' : ''}`}>
                    {player.rating}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="debug-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!canStart}
              onClick={handleStart}
            >
              Run knockout sim →
            </button>
            <p className="mode-hint">
              Style: {style} · Formation: {formationId} · 9 auto-filled slots
            </p>
          </div>
        </>
      )}
    </div>
  );
}
