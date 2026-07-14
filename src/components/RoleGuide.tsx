import { useState, type CSSProperties } from 'react';
import { trackRoleClick } from '../utils/analytics';

type RoleKey = 'WK' | 'OP' | 'MO' | 'AR' | 'BWL' | 'SP';

interface RoleInfo {
  key: RoleKey;
  code: string;
  name: string;
  pitch: string;
  summary: string;
  detail: string;
  examples: string;
  color: string;
}

const ROLES: RoleInfo[] = [
  {
    key: 'WK',
    code: 'WK',
    name: 'Wicketkeeper',
    pitch: 'Behind the stumps',
    summary: 'Keeps wicket and usually bats in the lower middle order.',
    detail:
      'The keeper stands behind the stumps, takes catches, effects stumpings, and starts counter-attacks. A weak WK hurts even a star batting line-up.',
    examples: 'Dhoni, Gilchrist, Sangakkara',
    color: '#c9951a',
  },
  {
    key: 'OP',
    code: 'OP',
    name: 'Opener',
    pitch: 'Top of the order',
    summary: 'Faces the new ball and sets the platform for the innings.',
    detail:
      'Openers see the new ball when it swings or seams most. You want at least two who can absorb pressure, rotate strike, and build a base for the middle order.',
    examples: 'Tendulkar, Haynes, Rohit',
    color: '#e85d2c',
  },
  {
    key: 'MO',
    code: 'MO',
    name: 'Middle order',
    pitch: 'Middle of the batting',
    summary: 'Rebuilds, accelerates, and finishes the innings.',
    detail:
      'Middle-order batters cover everything between a collapse rescue and a death-overs slog. They stabilise after early wickets or cash in when openers set a platform.',
    examples: 'Kohli, de Villiers, Root',
    color: '#166534',
  },
  {
    key: 'AR',
    code: 'AR',
    name: 'All-rounder',
    pitch: 'Flexible — bat & bowl',
    summary: 'Genuine two-way player who links batting depth and bowling options.',
    detail:
      'All-rounders fill gaps on both sides. They can bowl meaningful overs and bat in the middle or lower order. Great AR picks make unbalanced XIs work.',
    examples: 'Kapil Dev, Stokes, Hardik',
    color: '#1a5fb4',
  },
  {
    key: 'BWL',
    code: 'BWL',
    name: 'Fast bowler',
    pitch: 'Pace attack',
    summary: 'Speed, swing, and seam — front-line pace in your attack.',
    detail:
      'Fast bowlers (labelled BWL in the pool) bring pace and movement. New-ball specialists and death bowlers both count here. Empty BWL slots leave the sim exposed.',
    examples: 'McGrath, Akram, Bumrah',
    color: '#0d3d22',
  },
  {
    key: 'SP',
    code: 'BWL',
    name: 'Spinner',
    pitch: 'Spin attack',
    summary: 'Turn and control — shown as BWL (spinner) on player cards.',
    detail:
      'Spinners are tagged SP in the data but fill BWL slots on the field. Middle-overs control, dry runs, and wicket-taking turn win long knockout runs.',
    examples: 'Warne, Murali, Rashid',
    color: '#5c3d8f',
  },
];

function MiniPitch() {
  const dots: { role: RoleKey; top: string; left: string }[] = [
    { role: 'WK', top: '88%', left: '50%' },
    { role: 'OP', top: '72%', left: '30%' },
    { role: 'OP', top: '72%', left: '70%' },
    { role: 'MO', top: '54%', left: '22%' },
    { role: 'MO', top: '54%', left: '50%' },
    { role: 'MO', top: '54%', left: '78%' },
    { role: 'AR', top: '38%', left: '35%' },
    { role: 'AR', top: '38%', left: '65%' },
    { role: 'BWL', top: '20%', left: '22%' },
    { role: 'SP', top: '20%', left: '50%' },
    { role: 'BWL', top: '20%', left: '78%' },
  ];

  return (
    <div className="role-pitch" aria-hidden="true">
      <div className="role-pitch-oval" />
      <div className="role-pitch-strip" />
      {dots.map((dot, i) => {
        const role = ROLES.find((r) => r.key === dot.role)!;
        return (
          <span
            key={i}
            className="role-pitch-dot"
            style={{ top: dot.top, left: dot.left, background: role.color }}
            title={role.name}
          />
        );
      })}
    </div>
  );
}

function roleLabel(role: RoleInfo): string {
  return role.key === 'SP' ? 'BWL (spinner)' : role.key === 'BWL' ? 'BWL (fast)' : role.code;
}

export function RoleGuide() {
  const [active, setActive] = useState<RoleKey | null>('OP');
  const activeRole = ROLES.find((r) => r.key === active);

  return (
    <section className="guide-block" id="roles">
      <h3>What the roles mean</h3>
      <p className="guide-copy">
        Every slot on the field has a role code. Tap a card to see what WK, OP, MO, AR, and BWL
        mean — and where they sit on a typical XI.
      </p>

      <div className="role-layout">
        <div className="role-grid">
          {ROLES.map((role) => {
            const isActive = active === role.key;
            return (
              <button
                key={role.key}
                type="button"
                className={`role-card ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  const next = isActive ? null : role.key;
                  if (next) trackRoleClick(role.key);
                  setActive(next);
                }}
                aria-pressed={isActive}
                style={{ '--role-color': role.color } as CSSProperties}
              >
                <span className="role-card-badge">{role.code === 'SP' ? 'SP' : role.code}</span>
                <span className="role-card-code">{roleLabel(role)}</span>
                <span className="role-card-name">{role.name}</span>
              </button>
            );
          })}
        </div>

        <MiniPitch />
      </div>

      {activeRole && (
        <div className="role-detail" style={{ '--role-color': activeRole.color } as CSSProperties}>
          <div className="role-detail-head">
            <span className="role-detail-badge">{activeRole.key === 'SP' ? 'SP' : activeRole.code}</span>
            <div>
              <p className="role-detail-code">
                {roleLabel(activeRole)} · {activeRole.name}
              </p>
              <p className="role-detail-pitch">{activeRole.pitch}</p>
            </div>
          </div>
          <p className="role-detail-summary">{activeRole.summary}</p>
          <p className="role-detail-body">{activeRole.detail}</p>
          <p className="role-detail-examples">
            <strong>Examples:</strong> {activeRole.examples}
          </p>
        </div>
      )}

      <div className="formation-key">
        <h4>Formation numbers</h4>
        <p className="guide-copy">
          Chips like <strong>1-2-3-2-3</strong> count slots in order: wicketkeeper · openers ·
          middle order · all-rounders · bowlers.
        </p>
        <div className="formation-key-row">
          <span className="formation-key-num">1</span>
          <span className="formation-key-arrow">→</span>
          <span className="formation-key-label" style={{ color: ROLES[0].color }}>WK</span>
          <span className="formation-key-dot">·</span>
          <span className="formation-key-num">2</span>
          <span className="formation-key-arrow">→</span>
          <span className="formation-key-label" style={{ color: ROLES[1].color }}>OP</span>
          <span className="formation-key-dot">·</span>
          <span className="formation-key-num">3</span>
          <span className="formation-key-arrow">→</span>
          <span className="formation-key-label" style={{ color: ROLES[2].color }}>MO</span>
          <span className="formation-key-dot">·</span>
          <span className="formation-key-num">2</span>
          <span className="formation-key-arrow">→</span>
          <span className="formation-key-label" style={{ color: ROLES[3].color }}>AR</span>
          <span className="formation-key-dot">·</span>
          <span className="formation-key-num">3</span>
          <span className="formation-key-arrow">→</span>
          <span className="formation-key-label" style={{ color: ROLES[4].color }}>BWL</span>
        </div>
        <p className="formation-key-note">
          On player cards, fast bowlers show as <strong>BWL (fast)</strong> and spinners as{' '}
          <strong>BWL (spinner)</strong> — both can fill BWL slots on the field.
        </p>
      </div>
    </section>
  );
}
