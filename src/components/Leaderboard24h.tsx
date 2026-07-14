import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LeaderboardEntry } from '../utils/leaderboard';
import {
  getLeaderboard,
  getNextExpiryMs,
  LEADERBOARD_REFRESH_EVENT,
} from '../utils/leaderboard';
import { getPerfectRunRecord } from '../utils/format';

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function rankClass(index: number): string {
  if (index === 0) return 'leaderboard-row--top1';
  if (index === 1) return 'leaderboard-row--top2';
  if (index === 2) return 'leaderboard-row--top3';
  return '';
}

export function Leaderboard24h() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [countdown, setCountdown] = useState(() => {
    const ms = getNextExpiryMs();
    return ms === null ? null : formatCountdown(ms);
  });

  const refresh = useCallback(() => {
    const next = getLeaderboard().filter((entry) => entry.displayName !== 'Anonymous');
    setEntries(next);
    const ms = getNextExpiryMs(next);
    setCountdown(ms === null ? null : formatCountdown(ms));
  }, []);

  useEffect(() => {
    refresh();
    const onRefresh = () => refresh();
    window.addEventListener(LEADERBOARD_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(LEADERBOARD_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const ms = getNextExpiryMs();
      if (ms === null) {
        setCountdown(null);
        return;
      }
      setCountdown(formatCountdown(ms));
      if (ms <= 1000) refresh();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const emptyCopy = useMemo(
    () =>
      entries.length === 0
        ? 'No perfect unbeaten runs yet. Finish 6-0 (T20) or 7-0 (ODI) and take the first spot.'
        : null,
    [entries.length],
  );

  return (
    <aside className="leaderboard-panel" aria-label="Top 24 hour perfect runs">
      <div className="leaderboard-tabs">
        <span className="leaderboard-tab is-active">Top 100</span>
      </div>

      <div className="leaderboard-period-row">
        <span className="leaderboard-period is-active">Last 24h</span>
      </div>

      <div className="leaderboard-meta-row">
        <span className="leaderboard-meta-label">UTC reset</span>
        <span className="leaderboard-meta-value">{countdown ?? '24:00:00'}</span>
      </div>

      {emptyCopy ? (
        <p className="leaderboard-empty">{emptyCopy}</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, index) => (
            <li key={entry.id} className={`leaderboard-row ${rankClass(index)}`}>
              <span className="leaderboard-rank-badge">{index + 1}</span>
              <div className="leaderboard-body">
                <strong className="leaderboard-name">{entry.displayName}</strong>
                <div className="leaderboard-meta-line">
                  <span className="leaderboard-record">{getPerfectRunRecord(entry.format)}</span>
                  <span className="leaderboard-meta-text">
                    RD {entry.runDiff} · RATING {entry.rating}
                  </span>
                </div>
              </div>
              <span className="leaderboard-score">{entry.runDiff}</span>
            </li>
          ))}
        </ol>
      )}

      <details className="leaderboard-rules">
        <summary>Ranking rules</summary>
        <p>
          Only perfect unbeaten runs qualify — 6-0 in T20, 7-0 in ODI. Ranking sorts by run
          difference, runs for, fewer runs against, XI rating, then earlier submission time.
        </p>
      </details>
    </aside>
  );
}
