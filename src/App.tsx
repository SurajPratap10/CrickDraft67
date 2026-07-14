import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_FORMATION, getFormationForStyle } from './data/formations';
import type { GameMode, PlayStyle, TournamentFormat } from './types';
import { GameBoard } from './components/GameBoard';
import { GuideSections } from './components/GuideSections';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Leaderboard24h } from './components/Leaderboard24h';
import { BRAND } from './config/brand';
import { BrandName } from './components/BrandName';
import {
  observeContentSections,
  trackCtaClick,
  trackHashSection,
  trackSectionView,
} from './utils/analytics';
import './styles/globals.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tournamentFormat, setTournamentFormat] = useState<TournamentFormat>('t20');
  const [mode, setMode] = useState<GameMode>('classic');
  const [style, setStyle] = useState<PlayStyle>('balanced');
  const [formationId, setFormationId] = useState(DEFAULT_FORMATION);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    trackHashSection();
    const onHashChange = () => trackHashSection();
    window.addEventListener('hashchange', onHashChange);
    const disconnect = observeContentSections();
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      disconnect();
    };
  }, []);

  const gameContext = useCallback(
    () => ({
      format: tournamentFormat,
      mode,
      style,
      formation: formationId,
    }),
    [tournamentFormat, mode, style, formationId],
  );

  const scrollToGame = useCallback(() => {
    trackCtaClick('play_now', { ...gameContext(), location: 'hero' });
    trackSectionView('game');
    setInGame(true);
    document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' });
  }, [gameContext]);

  const handleStyleChange = useCallback(
    (next: PlayStyle) => {
      setStyle(next);
      if (!inGame) {
        setFormationId(getFormationForStyle(next));
      }
    },
    [inGame],
  );

  const handleFooterPlay = useCallback(() => {
    trackCtaClick('play_now', { ...gameContext(), location: 'footer' });
    trackSectionView('game');
  }, [gameContext]);

  return (
    <div className="home-wrap" id="top">
      <Header theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />

      <Hero
        tournamentFormat={tournamentFormat}
        mode={mode}
        style={style}
        formationId={formationId}
        onFormatChange={setTournamentFormat}
        onModeChange={setMode}
        onStyleChange={handleStyleChange}
        onFormationChange={setFormationId}
        onPlayNow={scrollToGame}
        inGame={inGame}
      />

      <div className="play-shell">
        <div id="game">
          <GameBoard
            key={tournamentFormat}
            tournamentFormat={tournamentFormat}
            mode={mode}
            style={style}
            formationId={formationId}
            onFormationChange={setFormationId}
          />
        </div>

        <Leaderboard24h />
      </div>

      <GuideSections />

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-brand">
            <BrandName size="md" />
          </p>
          <p className="site-footer-tag">{BRAND.shortDescription}</p>
          <nav className="site-footer-nav" aria-label="Footer">
            <a href="#game" onClick={handleFooterPlay}>
              Play now
            </a>
            <a href="#how-to-play">How to play</a>
            <a href="#faq">FAQ</a>
            <a href="#top">Back to top</a>
          </nav>
          <p className="site-footer-copy">
            ODI · 7 matches to win · T20 · 6 matches to win · No account required
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
