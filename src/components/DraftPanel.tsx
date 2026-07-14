import { useMemo } from 'react';
import type { GameMode, Player, Squad, TournamentFormat } from '../types';
import { FORMAT_LABELS } from '../data/squads';
import { formatRoles, getKnockoutCopy, getMatchCount } from '../utils/format';
import { getSquadStarPlayerIds, shufflePlayersForDisplay } from '../utils/gameLogic';

type PlayerState = 'pickable' | 'drafted' | 'no-slot';

interface DraftPanelProps {
  tournamentFormat: TournamentFormat;
  mode: GameMode;
  draw: Squad | null;
  rerollsLeft: number;
  selectedPlayer: Player | null;
  playerStates: Map<string, PlayerState>;
  validPlayerIds: Set<string>;
  onRoll: () => void;
  onRerollNation: () => void;
  onRerollWorldCup: () => void;
  onSelectPlayer: (player: Player) => void;
  picksMade: number;
  isDrafting: boolean;
  nationRerollOptions: number;
  wcRerollOptions: number;
  canRoll: boolean;
}

export function DraftPanel({
  tournamentFormat,
  mode,
  draw,
  rerollsLeft,
  selectedPlayer,
  playerStates,
  onRoll,
  onRerollNation,
  onRerollWorldCup,
  onSelectPlayer,
  picksMade,
  isDrafting,
  nationRerollOptions,
  wcRerollOptions,
  canRoll,
}: DraftPanelProps) {
  const matchCount = getMatchCount(tournamentFormat);
  const perfectRecord = `${matchCount}-0`;

  if (!draw) {
    return (
      <div className="draft-section">
        <p className="hero-eyebrow">
          {isDrafting ? `Draft zone · Pick ${picksMade + 1} of 11` : 'Draft zone / Start now'}
        </p>
        <h2>Play the {perfectRecord} game now</h2>
        <p className="draft-lead">
          Roll a {FORMAT_LABELS[tournamentFormat]} squad, draft one real tournament player per turn,
          and build a balanced XI. Then simulate {matchCount} knockout matches — win all{' '}
          {matchCount} to go {perfectRecord}.
        </p>
        <p className="draft-format-hint">{getKnockoutCopy(tournamentFormat)}</p>
        <div className="roll-zone">
          <p>Roll to draw a nation and {FORMAT_LABELS[tournamentFormat]} year</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onRoll} disabled={!canRoll}>
            Roll 🎲
          </button>
          {!canRoll && (
            <p className="roll-warning">All squads have been used — reset to play again.</p>
          )}
        </div>
      </div>
    );
  }

  const { players, starIds } = useMemo(() => {
    if (!draw) {
      return { players: [] as Player[], starIds: new Set<string>() };
    }
    return {
      players: shufflePlayersForDisplay(draw.players, draw.id),
      starIds: getSquadStarPlayerIds(draw.players),
    };
  }, [draw]);

  const pickableCount = [...playerStates.values()].filter((s) => s === 'pickable').length;

  return (
    <div className="draft-section">
      <p className="hero-eyebrow">Draft zone · Pick {picksMade + 1} of 11</p>

      <div className="draw-card">
        <p className="draw-label">Drawn</p>
        <div className="draw-nation">
          <span className="draw-flag">{draw.flag}</span>
          <span>{draw.nation}</span>
        </div>
        <p className="draw-tournament">
          {draw.tournament} {draw.year}
        </p>
      </div>

      {rerollsLeft > 0 && (
        <div className="reroll-block">
          <p className="reroll-hint">Not convinced? Reroll · {rerollsLeft} left</p>
          <div className="reroll-row">
            <button
              type="button"
              className="btn btn-secondary reroll-btn"
              onClick={onRerollNation}
              disabled={nationRerollOptions === 0}
              title={nationRerollOptions === 0 ? 'No other nations available' : 'Draw a different nation'}
            >
              ↺ Another nation
            </button>
            <button
              type="button"
              className="btn btn-secondary reroll-btn"
              onClick={onRerollWorldCup}
              disabled={wcRerollOptions === 0}
              title={
                wcRerollOptions === 0
                  ? `No other ${draw.nation} World Cup squads left`
                  : `Keep ${draw.nation}, change World Cup year`
              }
            >
              ↺ Another World Cup
            </button>
          </div>
          <p className="reroll-subhint">
            Another nation = new country · Another World Cup = same country, different year
          </p>
        </div>
      )}

      <div className="pool-header">
        <p className="control-label">Pick a player</p>
        <span className="pool-count">{pickableCount} fit your XI</span>
      </div>

      <div className="pool-list">
        {players.map((player) => {
          const state = playerStates.get(player.id) ?? 'no-slot';
          const isSelected = selectedPlayer?.id === player.id;
          const isStar = starIds.has(player.id);
          const canPick = state === 'pickable';

          return (
            <button
              key={player.id}
              type="button"
              className={[
                'pool-row',
                isSelected ? 'is-selected' : '',
                isStar ? 'pool-row--star' : '',
                `pool-row--${state}`,
              ].filter(Boolean).join(' ')}
              onClick={() => canPick && onSelectPlayer(player)}
              disabled={!canPick}
            >
              <span className="pool-num">#{player.number}</span>
              <span className="pool-name">{player.name}</span>
              <span className="pool-role">{formatRoles(player.roles)}</span>
              {isStar && mode === 'classic' && <span className="pool-badge pool-badge--star">★ Star</span>}
              {state === 'drafted' && <span className="pool-badge">In XI</span>}
              {state === 'no-slot' && <span className="pool-badge pool-badge--muted">No slot</span>}
              <span className={`pool-rating ${mode === 'almanac' ? 'hidden' : ''}`}>
                {player.rating}
              </span>
            </button>
          );
        })}
      </div>

      {selectedPlayer && (
        <p className="assign-hint">Now tap a highlighted slot on the field to confirm</p>
      )}

      {picksMade >= 10 && !selectedPlayer && (
        <p className="assign-hint">Final pick — one more player completes your XI</p>
      )}
    </div>
  );
}
