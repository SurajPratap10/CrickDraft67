import { useState } from 'react';
import type { SimulationResult } from '../types';
import type { PerfectRunMeta } from '../utils/leaderboard';
import { getMatchCount, getPerfectRunRecord } from '../utils/format';
import { getEntryRank, getLeaderboard, savePerfectRun } from '../utils/leaderboard';

interface PerfectRunModalProps {
  result: SimulationResult;
  meta: PerfectRunMeta;
  onClose: () => void;
}

export function PerfectRunModal({ result, meta, onClose }: PerfectRunModalProps) {
  const [name, setName] = useState('');
  const [rank, setRank] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name to appear on the board.');
      return;
    }

    const entry = savePerfectRun(result, meta, trimmed);
    setRank(getEntryRank(entry.id, getLeaderboard()));
    setSubmitted(true);
    setError('');
  };

  return (
    <div className="lb-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lb-modal-title">
      <div className="lb-modal">
        <p className="lb-modal-eyebrow">Top 24h run</p>
        <h2 className="lb-modal-title" id="lb-modal-title">
          {getPerfectRunRecord(meta.format)} · unbeaten campaign
        </h2>

        {!submitted ? (
          <>
            <p className="lb-modal-copy">
              You won all {getMatchCount(meta.format)} matches — a perfect{' '}
              {getPerfectRunRecord(meta.format)} run. Enter your name for the Top 24h board.
            </p>

            <label className="lb-modal-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                maxLength={24}
                placeholder="Player"
                autoFocus
                onChange={(e) => {
                  setError('');
                  setName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
            </label>

            {error && <p className="lb-modal-error">{error}</p>}

            <div className="lb-modal-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={handleSubmit}>
                Submit to board
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="lb-modal-success">
              Run submitted · rank <strong>#{rank}</strong>
            </p>
            <p className="lb-modal-copy">
              <strong>{name.trim()}</strong> is now on the Top 24h wall.
            </p>
            <div className="lb-modal-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
