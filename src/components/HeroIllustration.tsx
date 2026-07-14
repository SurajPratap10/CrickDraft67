import { FIELD_POSITIONS } from '../data/formations';

const HERO_XI = [
  { number: 7, name: 'Dhoni', role: 'WK' },
  { number: 1, name: 'Sehwag', role: 'OP' },
  { number: 45, name: 'Rohit', role: 'OP' },
  { number: 18, name: 'Kohli', role: 'MO' },
  { number: 10, name: 'Tendulkar', role: 'MO' },
  { number: 17, name: 'AB de V', role: 'MO' },
  { number: 33, name: 'Hardik', role: 'AR' },
  { number: 8, name: 'Jadeja', role: 'AR' },
  { number: 93, name: 'Bumrah', role: 'BWL' },
  { number: 56, name: 'Starc', role: 'BWL' },
  { number: 23, name: 'Warne', role: 'SP' },
] as const;

export function HeroIllustration({ variant = 'desktop' }: { variant?: 'mobile' | 'desktop' }) {
  return (
    <div className={`hero-illustration hero-illustration--${variant}`} aria-hidden="true">
      <div className="hero-pitch-frame">
        <div className="hero-pitch-oval">
          <div className="hero-pitch-stripes" />
          <div className="hero-pitch-boundary" />
          <div className="hero-pitch-center" />
          <div className="hero-pitch-wicket" />

          {HERO_XI.map((player, index) => {
            const pos = FIELD_POSITIONS[String(index)];
            return (
              <div
                key={player.name}
                className="hero-player"
                style={{ top: pos.top, left: pos.left }}
              >
                <span className="hero-player-badge">{player.number}</span>
                <span className="hero-player-name">{player.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
