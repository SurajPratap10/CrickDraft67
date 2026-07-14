import { ANALYTICS_SECTIONS, GA_MEASUREMENT_ID } from '../config/analytics';
import type { GameMode, PlayStyle, TournamentFormat } from '../types';

export type GameContext = {
  format: TournamentFormat;
  mode: GameMode;
  style?: PlayStyle;
  formation?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
const viewedSections = new Set<string>(['top']);

function gtagReady(): boolean {
  return typeof window.gtag === 'function';
}

function sendEvent(eventName: string, params?: Record<string, string | number | boolean>): void {
  if (!gtagReady()) return;
  window.gtag!('event', eventName, params);
}

function sendPageView(pagePath: string, pageTitle: string, pageLocation?: string): void {
  if (!gtagReady()) return;
  window.gtag!('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
    ...(pageLocation ? { page_location: pageLocation } : {}),
  });
}

function gameParams(ctx: GameContext): Record<string, string> {
  return {
    format: ctx.format,
    mode: ctx.mode,
    ...(ctx.style ? { style: ctx.style } : {}),
    ...(ctx.formation ? { formation: ctx.formation } : {}),
  };
}

/** Hook into gtag loaded from index.html — no duplicate script injection */
export function initAnalytics(): void {
  if (initialized) return;

  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  initialized = true;
}

/**
 * Virtual page view for SEO content sections.
 * Fires once per section per session (scroll or hash navigation).
 */
export function trackSectionView(sectionId: string): void {
  if (viewedSections.has(sectionId)) return;

  const section = ANALYTICS_SECTIONS[sectionId];
  if (!section) return;

  viewedSections.add(sectionId);

  const base = window.location.href.split('#')[0];
  sendPageView(section.path, `${section.title} — Crickdraft67`, `${base}#${sectionId}`);
}

/** Main CTA — Play now (hero, footer, etc.) */
export function trackCtaClick(
  ctaName: 'play_now',
  ctx: GameContext & { location: 'hero' | 'footer' | 'header' },
): void {
  sendEvent('cta_click', {
    cta_name: ctaName,
    location: ctx.location,
    ...gameParams(ctx),
  });
}

/** Funnel: first squad roll */
export function trackBeginDraft(ctx: GameContext): void {
  sendEvent('begin_draft', gameParams(ctx));
}

/** Funnel: XI complete */
export function trackCompleteDraft(ctx: GameContext): void {
  sendEvent('complete_draft', gameParams(ctx));
}

/** Funnel: knockout simulation started */
export function trackBeginSimulation(ctx: GameContext): void {
  sendEvent('begin_simulation', gameParams(ctx));
}

/** Funnel: campaign finished — key conversion */
export function trackCompleteGame(
  ctx: GameContext & {
    wins: number;
    losses: number;
    ties: number;
    perfect_run: boolean;
    knocked_out: boolean;
  },
): void {
  sendEvent('complete_game', {
    ...gameParams(ctx),
    wins: ctx.wins,
    losses: ctx.losses,
    ties: ctx.ties,
    perfect_run: ctx.perfect_run,
    knocked_out: ctx.knocked_out,
  });
}

/** Retention: draft again */
export function trackReplay(ctx: Pick<GameContext, 'format' | 'mode'>): void {
  sendEvent('replay', {
    format: ctx.format,
    mode: ctx.mode,
  });
}

/** User clicked a guide / content section link */
export function trackSectionClick(
  section: string,
  location: 'header' | 'mobile' | 'footer',
): void {
  sendEvent('section_click', { section, location });
}

/** FAQ accordion opened */
export function trackFaqOpen(questionIndex: number, question: string): void {
  sendEvent('faq_open', {
    question_index: questionIndex,
    question: question.slice(0, 100),
  });
}

/** Role guide card tapped */
export function trackRoleClick(role: string): void {
  sendEvent('role_click', { role });
}

/** Hero / pre-game setting changed */
export function trackSettingChange(
  setting: 'format' | 'mode' | 'style' | 'formation',
  value: string,
  location: 'hero' | 'game' = 'hero',
): void {
  sendEvent('setting_change', { setting, value, location });
}

/** Light / dark theme */
export function trackThemeToggle(theme: 'light' | 'dark'): void {
  sendEvent('theme_toggle', { theme });
}

/** Mid-draft squad reroll */
export function trackReroll(
  type: 'nation' | 'world_cup',
  format: TournamentFormat,
  rerollsLeft: number,
): void {
  sendEvent('reroll_used', { type, format, rerolls_left: rerollsLeft });
}

/** Skipped match-by-match animation */
export function trackSimulationSkipAll(format: TournamentFormat, mode: GameMode): void {
  sendEvent('simulation_skip_all', { format, mode });
}

/** Perfect run modal shown */
export function trackPerfectRunModal(format: TournamentFormat): void {
  sendEvent('perfect_run_modal', { format });
}

/** Name submitted to leaderboard */
export function trackLeaderboardSubmit(format: TournamentFormat, rank: number): void {
  sendEvent('leaderboard_submit', { format, rank });
}

/** Champion card downloaded */
export function trackCardDownload(format: TournamentFormat, perfectRun: boolean): void {
  sendEvent('card_download', { format, perfect_run: perfectRun });
}

/** Leaderboard ranking rules expanded */
export function trackLeaderboardRulesOpen(): void {
  sendEvent('leaderboard_rules_open', {});
}

/** Match scorecard expanded */
export function trackMatchScorecardOpen(matchNumber: number, format: TournamentFormat): void {
  sendEvent('match_scorecard_open', { match_number: matchNumber, format });
}

/** Observe SEO sections once they enter the viewport */
export function observeContentSections(): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const sectionId = entry.target.id;
        if (sectionId) trackSectionView(sectionId);
      }
    },
    { root: null, rootMargin: '0px', threshold: 0.35 },
  );

  for (const sectionId of Object.keys(ANALYTICS_SECTIONS)) {
    if (sectionId === 'top') continue;
    const el = document.getElementById(sectionId);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}

/** Track hash-based section navigation (#faq, #rules, etc.) */
export function trackHashSection(): void {
  const hash = window.location.hash.replace('#', '');
  if (hash) trackSectionView(hash);
}
