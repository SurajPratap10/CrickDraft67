interface DraftProgressProps {
  picksMade: number;
  total?: number;
}

export function DraftProgress({ picksMade, total = 11 }: DraftProgressProps) {
  const pct = Math.round((picksMade / total) * 100);
  return (
    <div className="draft-progress" aria-label={`${picksMade} of ${total} picks made`}>
      <div className="draft-progress-meta">
        <span className="draft-progress-label">XI progress</span>
        <span className="draft-progress-count">
          {picksMade}/{total}
        </span>
      </div>
      <div className="draft-progress-track">
        <div className="draft-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
