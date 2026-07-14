import { useRef, useState } from 'react';
import { BRAND } from '../config/brand';
import { toPng } from 'html-to-image';
import type { SimulationResult as SimResult, TournamentFormat } from '../types';
import { getPerfectRunRecord, shortName } from '../utils/format';

interface ChampionCardProps {
  result: SimResult;
  format: TournamentFormat;
}

export function ChampionCard({ result, format }: ChampionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const record = `${result.wins}-${result.losses}`;

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#f8f4ec',
      });
      const link = document.createElement('a');
      link.download = `${BRAND.slug}-${result.seed}-${record}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const sortedLineup = [...result.lineup].sort((a, b) => a.slotIndex - b.slotIndex);
  const totalsMap = new Map(result.playerTotals.map((t) => [t.player.name, t]));
  const motm = result.manOfTheSeries;

  return (
    <div className="champion-wrap">
      <div className="champion-card" ref={cardRef}>
        <div className="champion-top">
          <span className="champion-brand">🏏 {getPerfectRunRecord(format)}</span>
          <span className="champion-seed">seed #{result.seed}</span>
        </div>

        <p className="champion-title">{result.headline}</p>
        <p className="champion-score">{record}</p>
        <p className="champion-sub">{result.subheadline}</p>

        <div className="champion-stats">
          <div className="champion-stat">
            <strong>{result.runsFor}</strong>
            <span>Runs for</span>
          </div>
          <div className="champion-stat">
            <strong>{result.runsAgainst}</strong>
            <span>Runs against</span>
          </div>
          <div className="champion-stat">
            <strong>{result.wicketsTaken}</strong>
            <span>Wickets</span>
          </div>
          <div className="champion-stat">
            <strong>{result.wins}</strong>
            <span>Wins</span>
          </div>
        </div>

        <div className="champion-xi">
          {sortedLineup.map((p, i) => {
            const t = totalsMap.get(p.name);
            const isMotm = p.name === motm.player.name;
            return (
              <div key={p.id} className={`champion-row ${isMotm ? 'is-star' : ''}`}>
                <span className="champion-num">{i + 1}</span>
                <span className="champion-name">{shortName(p.name)}</span>
                <span className="champion-meta">
                  {t ? `${t.totalRuns}r · ${t.totalWickets}w` : '—'}
                </span>
                <span className="champion-origin">
                  {p.squadNation.slice(0, 3).toUpperCase()} {p.squadYear}
                </span>
              </div>
            );
          })}
        </div>

        <div className="champion-motm">
          <p className="champion-motm-label">🏆 Man of the Series</p>
          <p className="champion-motm-name">{motm.player.name}</p>
          <p className="champion-motm-stats">
            {motm.totalRuns} runs · {motm.totalWickets} wickets · {motm.fifties} fifties ·
            best {motm.bestBowling}
          </p>
        </div>

        <div className="champion-badge">{result.badge}</div>
        <p className="champion-footer">{BRAND.slug} · build yours 🏏</p>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg champion-download"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? 'Generating…' : '⬇ Download result card'}
      </button>
    </div>
  );
}
