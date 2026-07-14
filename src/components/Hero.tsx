import type { GameMode, PlayStyle, TournamentFormat } from '../types';
import { FORMAT_LABELS, FORMAT_YEARS } from '../data/squads';
import { getPerfectRunRecord } from '../utils/format';
import { BRAND } from '../config/brand';
import { BrandName } from './BrandName';
import { FORMATIONS, STYLE_FIELD_HINTS } from '../data/formations';
import { HeroIllustration } from './HeroIllustration';

interface HeroProps {
  tournamentFormat: TournamentFormat;
  mode: GameMode;
  style: PlayStyle;
  formationId: string;
  onFormatChange: (format: TournamentFormat) => void;
  onModeChange: (mode: GameMode) => void;
  onStyleChange: (style: PlayStyle) => void;
  onFormationChange: (id: string) => void;
  onPlayNow: () => void;
  inGame: boolean;
}

export function Hero({
  tournamentFormat,
  mode,
  style,
  formationId,
  onFormatChange,
  onModeChange,
  onStyleChange,
  onFormationChange,
  onPlayNow,
  inGame,
}: HeroProps) {
  const formatLabel = FORMAT_LABELS[tournamentFormat];
  const yearRange = FORMAT_YEARS[tournamentFormat];
  const perfectRecord = getPerfectRunRecord(tournamentFormat);

  return (
    <section className="hero-section" aria-labelledby="home-title">
      <div className="hero-grid">
        <div className="hero-content">
          <p className="hero-eyebrow">
            {perfectRecord} · {formatLabel} · {yearRange}
          </p>
          <p className="hero-score" aria-hidden="true">
            {perfectRecord}
          </p>
          <h1 className="hero-title" id="home-title">
            <BrandName size="lg" />
            <br />
            build your dream
            <br />
            World Cup XI 🏏
          </h1>
          <p className="hero-desc">{BRAND.shortDescription}</p>
          <div className="hero-cta-row">
            <button type="button" className="btn btn-primary home-cta-main" onClick={onPlayNow}>
              Play now
            </button>
          </div>

          <div className="control-block">
            <p className="control-label">Tournament · squad pool</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip chip-format ${tournamentFormat === 't20' ? 'is-active' : ''}`}
                onClick={() => onFormatChange('t20')}
                disabled={inGame}
              >
                🎯 T20 World Cup
              </button>
              <button
                type="button"
                className={`chip chip-format ${tournamentFormat === 'odi' ? 'is-active' : ''}`}
                onClick={() => onFormatChange('odi')}
                disabled={inGame}
              >
                🏏 ODI World Cup
              </button>
            </div>
            <p className="mode-hint">
              {tournamentFormat === 't20'
                ? 'Real T20 World Cup squads only — 2007 to 2024. Knockout sim: 6 matches · chase 6-0.'
                : 'Real ODI World Cup squads only — 1975 to 2023. Knockout sim: 7 matches · chase 7-0.'}
            </p>
          </div>

          <div className="control-block">
            <p className="control-label">Mode · difficulty</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip ${mode === 'classic' ? 'is-active' : ''}`}
                onClick={() => onModeChange('classic')}
              >
                Classic
              </button>
              <button
                type="button"
                className={`chip ${mode === 'almanac' ? 'is-active' : ''}`}
                onClick={() => onModeChange('almanac')}
              >
                Almanac
              </button>
            </div>
            <p className="mode-hint">
              {mode === 'classic'
                ? 'Player strength is visible, so every pick has clear information.'
                : 'Ratings are hidden — draft from memory, roles, and tournament instinct.'}
            </p>
          </div>

          {!inGame && (
            <>
              <div className="control-block">
                <p className="control-label">Play style</p>
                <div className="chip-row">
                  {(['defensive', 'balanced', 'attacking'] as PlayStyle[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`chip ${style === s ? 'is-active' : ''}`}
                      onClick={() => onStyleChange(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="mode-hint">{STYLE_FIELD_HINTS[style]}</p>
              </div>

              <div className="control-block">
                <p className="control-label">Field setting</p>
                <div className="chip-row">
                  {FORMATIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`chip ${formationId === f.id ? 'is-active' : ''}`}
                      onClick={() => onFormationChange(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="mode-hint">
                  XI shape on the pitch — WK, OP, MO, AR, and BWL slots. Auto-picks when you
                  change play style; override manually if you want.
                </p>
              </div>
            </>
          )}
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
