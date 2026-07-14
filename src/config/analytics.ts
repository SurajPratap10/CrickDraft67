/** GA4 Measurement ID — update here to change tracking property */
export const GA_MEASUREMENT_ID = 'G-129MTLPM6Y';

/** SEO / content sections mapped to virtual page paths */
export const ANALYTICS_SECTIONS: Record<string, { title: string; path: string }> = {
  top: { title: 'Home', path: '/' },
  game: { title: 'Play Game', path: '/play' },
  'how-to-play': { title: 'How to Play', path: '/how-to-play' },
  rules: { title: 'Rules', path: '/rules' },
  roles: { title: 'Player Roles', path: '/roles' },
  strategy: { title: 'Draft Strategy', path: '/strategy' },
  faq: { title: 'FAQ', path: '/faq' },
};
