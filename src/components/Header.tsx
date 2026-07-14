import { BRAND } from '../config/brand';
import { BrandName } from './BrandName';
import { trackSectionClick, trackThemeToggle } from '../utils/analytics';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: '#how-to-play', section: 'how-to-play', label: 'How to play' },
  { href: '#rules', section: 'rules', label: 'Rules' },
  { href: '#roles', section: 'roles', label: 'Roles' },
  { href: '#strategy', section: 'strategy', label: 'Strategy' },
  { href: '#faq', section: 'faq', label: 'FAQ' },
] as const;

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="home-head">
      <nav className="home-nav" aria-label="Main navigation">
        <a className="home-brand" href="#top" aria-label={`${BRAND.name} home`}>
          <BrandName size="sm" />
        </a>

        <div className="home-nav-links" aria-label="Page sections">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => trackSectionClick(link.section, 'header')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="home-nav-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => {
              const next = theme === 'light' ? 'dark' : 'light';
              trackThemeToggle(next);
              onToggleTheme();
            }}
            aria-label="Switch light or dark theme"
          >
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <nav className="home-nav-mobile" aria-label="Mobile page sections">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => trackSectionClick(link.section, 'mobile')}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
