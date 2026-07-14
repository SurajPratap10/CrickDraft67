import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameMode, MatchResult, SimulationResult as SimResult, TournamentFormat } from '../types';
import { ChampionCard } from './ChampionCard';
import { PerfectRunModal } from './PerfectRunModal';
import {
  getKnockoutCopy,
  getPerfectRunRecord,
  getRoadToHeadline,
  getWinTargetLabel,
} from '../utils/format';
import { isKnockedOut, isPerfectRun } from '../utils/leaderboard';
import { trackBeginSimulation, trackCompleteGame, trackReplay } from '../utils/analytics';

interface SimulationResultProps {
  result: SimResult;
  onPlayAgain: () => void;
  meta: {
    formation: string;
    mode: GameMode;
    format: TournamentFormat;
  };
}

type SimStep = 'ready' | 'animating' | 'result' | 'done';

const ANIMATION_MS = 2400;

function MatchCard({ match }: { match: MatchResult }) {
  const resultLabel =
    match.result === 'win' ? 'WON' : match.result === 'loss' ? 'LOST' : 'TIED';
  const resultClass = `match-card-result match-card-result--${match.result}`;

  return (
    <article className="match-card match-card--visible">
      <div className="match-card-head">
        <span className="match-card-num">Match {match.match}</span>
        <span className={resultClass}>{resultLabel}</span>
      </div>
      <p className="match-card-vs">
        <span>Your XI</span>
        <strong>
          {match.ourScore}/{match.ourWickets}
        </strong>
        <span className="match-card-vs-text">vs</span>
        <span>{match.opponent}</span>
        <strong>
          {match.oppScore}/{match.oppWickets}
        </strong>
      </p>
      <p className="match-card-margin">🏏 {match.margin}</p>

      <div className="match-card-highlights">
        <div className="match-highlight">
          <span className="match-highlight-label">🏏 Top scorer</span>
          <strong>
            {match.topScorer.name} — {match.topScorer.runs} ({match.topScorer.balls})
          </strong>
        </div>
        <div className="match-highlight">
          <span className="match-highlight-label">🎯 Top bowler</span>
          <strong>
            {match.topBowler.name} — {match.topBowler.wickets}/{match.topBowler.runs}
          </strong>
        </div>
      </div>

      <details className="match-card-details">
        <summary>Full scorecard</summary>
        <table className="match-detail-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Runs</th>
              <th>Balls</th>
              <th>Wkts</th>
              <th>Econ</th>
            </tr>
          </thead>
          <tbody>
            {match.playerStats
              .filter((s) => s.runs > 0 || s.wickets > 0)
              .sort((a, b) => b.runs - a.runs || b.wickets - a.wickets)
              .map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.runs || '—'}</td>
                  <td>{s.balls || '—'}</td>
                  <td>{s.wickets || '—'}</td>
                  <td>
                    {s.wickets > 0
                      ? (s.runsConceded / Math.max(s.wickets * 4, 4)).toFixed(1)
                      : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </article>
  );
}

function LiveTally({ wins, losses, ties }: { wins: number; losses: number; ties: number }) {
  return (
    <p className="sim-live-record">
      {wins}W · {losses}L{ties > 0 ? ` · ${ties}T` : ''}
    </p>
  );
}

export function SimulationResult({ result, onPlayAgain, meta }: SimulationResultProps) {
  const [step, setStep] = useState<SimStep>('ready');
  const [matchIndex, setMatchIndex] = useState(0);
  const [revealed, setRevealed] = useState<MatchResult[]>([]);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showPerfectModal, setShowPerfectModal] = useState(false);
  const completeTracked = useRef(false);

  const totalMatches = result.totalMatches;
  const perfectRecord = getPerfectRunRecord(meta.format);
  const currentMatch = result.matches[matchIndex];
  const isDone = step === 'done';

  const liveStats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    for (const match of revealed) {
      if (match.result === 'win') wins++;
      else if (match.result === 'loss') losses++;
      else ties++;
    }
    return { wins, losses, ties };
  }, [revealed]);

  const startTournament = useCallback(() => {
    trackBeginSimulation({
      format: meta.format,
      mode: meta.mode,
      formation: meta.formation,
    });
    setMatchIndex(0);
    setRevealed([]);
    setShowOutcome(false);
    setStep('animating');
  }, [meta.format, meta.mode, meta.formation]);

  const goToNextMatch = useCallback(() => {
    if (matchIndex >= result.matches.length - 1) {
      setStep('done');
      return;
    }
    setMatchIndex((index) => index + 1);
    setShowOutcome(false);
    setStep('animating');
  }, [matchIndex, result.matches.length]);

  const finishCampaign = useCallback(() => {
    setStep('done');
  }, []);

  const simulateAll = useCallback(() => {
    setRevealed(result.matches);
    setStep('done');
  }, [result.matches]);

  const isEliminated = currentMatch?.result === 'loss';
  const knockedOut = isKnockedOut(result);

  useEffect(() => {
    if (step !== 'animating' || !currentMatch) return;

    setShowOutcome(false);
    const revealTimer = window.setTimeout(() => setShowOutcome(true), ANIMATION_MS - 900);
    const finishTimer = window.setTimeout(() => {
      setRevealed((prev) => {
        if (prev.some((match) => match.match === currentMatch.match)) return prev;
        return [...prev, currentMatch];
      });
      setStep('result');
    }, ANIMATION_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [step, currentMatch]);

  useEffect(() => {
    if (step === 'done' && isPerfectRun(result)) {
      setShowPerfectModal(true);
    }
  }, [step, result]);

  useEffect(() => {
    if (step !== 'done' || completeTracked.current) return;
    completeTracked.current = true;
    trackCompleteGame({
      format: meta.format,
      mode: meta.mode,
      formation: meta.formation,
      wins: result.wins,
      losses: result.losses,
      ties: result.ties,
      perfect_run: isPerfectRun(result),
      knocked_out: knockedOut,
    });
  }, [step, result, meta.format, meta.mode, meta.formation, knockedOut]);

  const handlePlayAgain = useCallback(() => {
    trackReplay({ format: meta.format, mode: meta.mode });
    onPlayAgain();
  }, [meta.format, meta.mode, onPlayAgain]);

  const outcomeLabel =
    currentMatch?.result === 'win'
      ? 'WON'
      : currentMatch?.result === 'loss'
        ? 'LOST'
        : 'TIED';

  return (
    <div className="sim-result-page">
      {step === 'ready' && (
        <section className="sim-ready" aria-label="Start tournament">
          <p className="draw-label">🏏 XI locked · {getKnockoutCopy(meta.format)}</p>
          <h2 className="sim-headline">{getRoadToHeadline(meta.format)}</h2>
          <p className="sim-ready-copy">
            {getWinTargetLabel(meta.format)}. One loss ends your run — win every knockout
            match or go home. Press the button to advance after each result.
          </p>
          <div className="sim-ready-stats">
            <div className="sim-stat">
              <span>Matches to win</span>
              <strong>{totalMatches}</strong>
            </div>
            <div className="sim-stat">
              <span>XI rating</span>
              <strong>{result.rating}</strong>
            </div>
            <div className="sim-stat">
              <span>Seed</span>
              <strong>#{result.seed}</strong>
            </div>
          </div>
          <div className="sim-ready-actions">
            <button type="button" className="btn btn-primary btn-lg sim-start-btn" onClick={startTournament}>
              Start play
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={simulateAll}>
              Simulate all
            </button>
          </div>
        </section>
      )}

      {(step === 'animating' || step === 'result') && currentMatch && (
        <section className="sim-live-wrap" aria-live="polite">
          <div className="sim-live-header">
            <p className="draw-label">Match {currentMatch.match} of {totalMatches}</p>
            <LiveTally {...liveStats} />
          </div>

          {step === 'animating' && (
            <div className="sim-live-skip">
              <button type="button" className="btn btn-secondary" onClick={simulateAll}>
                Simulate all
              </button>
            </div>
          )}

          {step === 'animating' && (
            <div
              className={[
                'sim-live-stage',
                showOutcome ? `sim-live-stage--${currentMatch.result}` : 'sim-live-stage--running',
              ].join(' ')}
            >
              <p className="sim-live-vs">
                <span>Your XI</span>
                <span className="sim-live-vs-divider">vs</span>
                <strong>{currentMatch.opponent}</strong>
              </p>

              {!showOutcome ? (
                <div className="sim-live-anim">
                  <span className="sim-live-ball" aria-hidden="true">
                    🏏
                  </span>
                  <p className="sim-live-status">Simulating innings…</p>
                  <div className="sim-live-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : (
                <div className={`sim-live-outcome sim-live-outcome--${currentMatch.result}`}>
                  <p className="sim-live-outcome-label">{outcomeLabel}</p>
                  <p className="sim-live-outcome-score">
                    {currentMatch.ourScore}/{currentMatch.ourWickets}
                    <span> vs </span>
                    {currentMatch.oppScore}/{currentMatch.oppWickets}
                  </p>
                  <p className="sim-live-outcome-margin">🏏 {currentMatch.margin}</p>
                </div>
              )}
            </div>
          )}

          {step === 'result' && (
            <div className="sim-live-result">
              {isEliminated && (
                <p className="sim-knockout-banner">Campaign over · knocked out in match {currentMatch.match}</p>
              )}
              <MatchCard match={currentMatch} />
              <div className="sim-live-actions">
                {isEliminated ? (
                  <button type="button" className="btn btn-primary" onClick={finishCampaign}>
                    See final results →
                  </button>
                ) : matchIndex < result.matches.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={goToNextMatch}>
                    Next match →
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={finishCampaign}>
                    See final results →
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={simulateAll}>
                  Simulate all
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {isDone && (
        <>
          <div className="sim-summary">
            <p className="draw-label">
              {knockedOut
                ? `🏏 Knocked out · match ${result.matches.length} of ${totalMatches}`
                : `🏏 Tournament complete · ${perfectRecord}`}
            </p>
            <h2 className="sim-headline">{result.headline}</h2>
            <p className="sim-record">
              {result.wins}W · {result.losses}L{result.ties > 0 ? ` · ${result.ties}T` : ''}
            </p>
            <p className="sim-subheadline">{result.subheadline}</p>
            <p className="sim-story">{result.story}</p>

            <div className="sim-stats">
              <div className="sim-stat">
                <span>Runs for</span>
                <strong>{result.runsFor}</strong>
              </div>
              <div className="sim-stat">
                <span>Runs vs</span>
                <strong>{result.runsAgainst}</strong>
              </div>
              <div className="sim-stat">
                <span>Wickets</span>
                <strong>{result.wicketsTaken}</strong>
              </div>
              <div className="sim-stat">
                <span>Rating</span>
                <strong>{result.rating}</strong>
              </div>
            </div>
          </div>

          <section className="match-feed" aria-label="Match by match results">
            <h3 className="match-feed-title">🏏 Match by match</h3>
            <p className="match-feed-sub">
              {knockedOut
                ? 'Every match you played before elimination'
                : 'Full campaign log — every score and star performance'}
            </p>
            <div className="match-feed-list">
              {result.matches.map((match) => (
                <MatchCard key={match.match} match={match} />
              ))}
            </div>
          </section>

          {isPerfectRun(result) && showPerfectModal && (
            <PerfectRunModal
              result={result}
              meta={meta}
              onClose={() => setShowPerfectModal(false)}
            />
          )}

          <section className="champion-section" aria-label="Final result card">
            <h3 className="match-feed-title">🏆 Final card</h3>
            <p className="match-feed-sub">
              Man of the Series, full XI stats — download and share
            </p>
            <ChampionCard result={result} format={meta.format} />
          </section>
        </>
      )}

      <div className="sim-actions">
        <button type="button" className="btn btn-secondary" onClick={handlePlayAgain}>
          Draft again
        </button>
      </div>
    </div>
  );
}
