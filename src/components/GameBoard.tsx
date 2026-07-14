import { useCallback, useMemo, useState } from 'react';
import {
  countNationAlternatives,
  countOtherNationAlternatives,
  getAnotherNationSquad,
  getFormatStats,
  getRandomSquad,
  getSameNationOtherWorldCup,
} from '../data/squads';
import { FORMATIONS } from '../data/formations';
import type {
  DraftedPlayer,
  GameMode,
  GamePhase,
  PlayStyle,
  Player,
  SimulationResult,
  Squad,
  TournamentFormat,
} from '../types';
import {
  assignPlayer,
  getDraftedPlayerKeys,
  getFormation,
  getValidSlotsForPlayer,
  isLineupComplete,
  playerKey,
} from '../utils/gameLogic';
import { simulateTournament } from '../utils/simulation';
import { CricketField } from './CricketField';
import { DraftPanel } from './DraftPanel';
import { DraftProgress } from './DraftProgress';
import { SimulationResult as SimResultView } from './SimulationResult';

interface GameBoardProps {
  tournamentFormat: TournamentFormat;
  mode: GameMode;
  style: PlayStyle;
  formationId: string;
  onFormationChange: (id: string) => void;
}

const INITIAL_REROLLS = 2;
const TOTAL_PICKS = 11;

export function GameBoard({
  tournamentFormat,
  mode,
  style,
  formationId,
  onFormationChange,
}: GameBoardProps) {
  const formatStats = useMemo(() => getFormatStats(tournamentFormat), [tournamentFormat]);
  const formation = useMemo(() => getFormation(formationId), [formationId]);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [lineup, setLineup] = useState<(DraftedPlayer | null)[]>(() => Array(TOTAL_PICKS).fill(null));
  const [draw, setDraw] = useState<Squad | null>(null);
  const [rerollsLeft, setRerollsLeft] = useState(INITIAL_REROLLS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [usedSquadIds, setUsedSquadIds] = useState<string[]>([]);

  const picksMade = lineup.filter(Boolean).length;
  const draftedKeys = useMemo(() => getDraftedPlayerKeys(lineup), [lineup]);

  const validSlots = useMemo(() => {
    if (!selectedPlayer) return [];
    return getValidSlotsForPlayer(selectedPlayer, formation, lineup);
  }, [selectedPlayer, formation, lineup]);

  const playerStates = useMemo(() => {
    if (!draw) return new Map<string, 'pickable' | 'drafted' | 'no-slot'>();

    const states = new Map<string, 'pickable' | 'drafted' | 'no-slot'>();
    for (const player of draw.players) {
      if (draftedKeys.has(playerKey(player.name))) {
        states.set(player.id, 'drafted');
        continue;
      }
      const canFill = getValidSlotsForPlayer(player, formation, lineup).length > 0;
      states.set(player.id, canFill ? 'pickable' : 'no-slot');
    }
    return states;
  }, [draw, formation, lineup, draftedKeys]);

  const validPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    playerStates.forEach((state, id) => {
      if (state === 'pickable') ids.add(id);
    });
    return ids;
  }, [playerStates]);

  const nationRerollOptions = draw
    ? countOtherNationAlternatives(tournamentFormat, draw.nation, usedSquadIds)
    : 0;
  const wcRerollOptions = draw
    ? countNationAlternatives(tournamentFormat, draw.nation, draw.id, usedSquadIds)
    : 0;

  const startDraw = useCallback(() => {
    const squad = getRandomSquad(tournamentFormat, usedSquadIds);
    if (!squad) return;
    setDraw(squad);
    setRerollsLeft(INITIAL_REROLLS);
    setSelectedPlayer(null);
    setPhase('drafting');
  }, [tournamentFormat, usedSquadIds]);

  const handleRerollNation = useCallback(() => {
    if (!draw || rerollsLeft <= 0 || nationRerollOptions === 0) return;
    const squad = getAnotherNationSquad(tournamentFormat, draw.nation, draw.id, usedSquadIds);
    if (!squad) return;
    setDraw(squad);
    setRerollsLeft((r) => r - 1);
    setSelectedPlayer(null);
  }, [draw, rerollsLeft, nationRerollOptions, tournamentFormat, usedSquadIds]);

  const handleRerollWorldCup = useCallback(() => {
    if (!draw || rerollsLeft <= 0 || wcRerollOptions === 0) return;
    const squad = getSameNationOtherWorldCup(tournamentFormat, draw.nation, draw.id, usedSquadIds);
    if (!squad) return;
    setDraw(squad);
    setRerollsLeft((r) => r - 1);
    setSelectedPlayer(null);
  }, [draw, rerollsLeft, wcRerollOptions, tournamentFormat, usedSquadIds]);

  const handleSelectPlayer = useCallback(
    (player: Player) => {
      if (!validPlayerIds.has(player.id)) return;
      setSelectedPlayer((prev) => (prev?.id === player.id ? null : player));
    },
    [validPlayerIds],
  );

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      if (!selectedPlayer || !draw) return;
      const valid = getValidSlotsForPlayer(selectedPlayer, formation, lineup);
      if (!valid.includes(slotIndex)) return;
      if (draftedKeys.has(playerKey(selectedPlayer.name))) return;

      const newLineup = assignPlayer(selectedPlayer, slotIndex, draw, lineup);
      setLineup(newLineup);
      setUsedSquadIds((prev) => [...prev, draw.id]);
      setSelectedPlayer(null);
      setDraw(null);
      setRerollsLeft(INITIAL_REROLLS);

      if (isLineupComplete(newLineup)) {
        const filled = newLineup.filter(Boolean) as DraftedPlayer[];
        setSimulation(simulateTournament(filled, style, tournamentFormat));
        setPhase('simulating');
      }
    },
    [selectedPlayer, draw, formation, lineup, style, draftedKeys],
  );

  const resetGame = useCallback(() => {
    setLineup(Array(TOTAL_PICKS).fill(null));
    setDraw(null);
    setSelectedPlayer(null);
    setSimulation(null);
    setUsedSquadIds([]);
    setRerollsLeft(INITIAL_REROLLS);
    setPhase('setup');
  }, []);

  if (phase === 'simulating' && simulation) {
    return (
      <SimResultView
        result={simulation}
        onPlayAgain={resetGame}
        meta={{ formation: formationId, mode, format: tournamentFormat }}
      />
    );
  }

  return (
    <section className="game-area" aria-label="Game area">
      <div className="game-panel">
        <DraftProgress picksMade={picksMade} />

        {phase === 'drafting' && (
          <div className="control-block game-controls">
            <p className="control-label">Field setting</p>
            <div className="chip-row">
              {FORMATIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip ${formationId === f.id ? 'is-active' : ''}`}
                  onClick={() => onFormationChange(f.id)}
                  disabled={picksMade > 0}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="game-grid">
          <div className="field-column">
            <CricketField
              formation={formation}
              lineup={lineup}
              selectedPlayer={selectedPlayer}
              validSlots={validSlots}
              onSlotClick={handleSlotClick}
            />
            <div className="stats-row">
              <span><strong>{formatStats.nations}</strong> nations</span>
              <span className="stats-dot">·</span>
              <span><strong>{formatStats.squads}</strong> squads</span>
              <span className="stats-dot">·</span>
              <span><strong>{formatStats.players.toLocaleString()}</strong> players</span>
            </div>
          </div>

          <DraftPanel
            tournamentFormat={tournamentFormat}
            mode={mode}
            draw={draw}
            rerollsLeft={rerollsLeft}
            selectedPlayer={selectedPlayer}
            playerStates={playerStates}
            validPlayerIds={validPlayerIds}
            onRoll={startDraw}
            onRerollNation={handleRerollNation}
            onRerollWorldCup={handleRerollWorldCup}
            onSelectPlayer={handleSelectPlayer}
            picksMade={picksMade}
            isDrafting={phase === 'drafting'}
            nationRerollOptions={nationRerollOptions}
            wcRerollOptions={wcRerollOptions}
            canRoll={usedSquadIds.length < formatStats.squads}
          />
        </div>
      </div>
    </section>
  );
}
