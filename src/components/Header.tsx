import { BRAND } from '../config/brand';
import { BrandName } from './BrandName';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  debugFlow: boolean;
  onToggleDebug: () => void;
}

export function Header({ theme, onToggleTheme, debugFlow, onToggleDebug }: HeaderProps) {
  return (
    <header className="home-head">
      <nav className="home-nav" aria-label="Main navigation">
        <a className="home-brand" href="#top" aria-label={`${BRAND.name} home`}>
          <BrandName size="sm" />
        </a>

        <div className="home-nav-links" aria-label="Page sections">
          <a href="#how-to-play">How to play</a>
          <a href="#rules">Rules</a>
          <a href="#roles">Roles</a>
          <a href="#strategy">Strategy</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="home-nav-actions">
          <button
            type="button"
            className={`theme-toggle debug-toggle ${debugFlow ? 'is-active' : ''}`}
            onClick={onToggleDebug}
            aria-pressed={debugFlow}
            aria-label="Toggle debug two-player simulation mode"
          >
            Debug 2P
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Switch light or dark theme"
          >
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>
    </header>
  );
}
