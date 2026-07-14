import { RoleGuide } from './RoleGuide';
import { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';
import { BrandName } from './BrandName';

const FAQ_ITEMS = [
  {
    q: `What is ${BRAND.name}?`,
    a: `${BRAND.name} is a free online Cricket World Cup draft game. Each turn you roll a real national squad from a specific tournament year, pick one player for your XI, and repeat until all eleven slots are filled. Then your team runs a knockout World Cup simulation — 6 matches in T20 mode, 7 in ODI mode.`,
  },
  {
    q: `How do you play the ${BRAND.name} cricket draft game?`,
    a: 'Choose ODI or T20 World Cup, pick a formation and style, then hit Roll. You get one nation and one tournament year per turn. Select a player who fits an open role on the field, confirm the slot, and repeat. When the XI is complete, simulate the knockout campaign match by match.',
  },
  {
    q: `Is ${BRAND.name} free to play?`,
    a: `Yes. ${BRAND.name} is completely free in the browser — no download, no account, no paywall. Draft squads, simulate tournaments, and chase a perfect unbeaten run on the Top 24h board.`,
  },
  {
    q: `How many matches are in ${BRAND.name}?`,
    a: 'T20 World Cup mode runs 6 knockout matches. ODI World Cup mode runs 7. One loss ends your run immediately. A perfect campaign is 6-0 in T20 or 7-0 in ODI.',
  },
  {
    q: 'What is the difference between ODI and T20 mode?',
    a: 'T20 mode uses T20 World Cup squads from 2007–2024 with a 6-match knockout sim. ODI mode draws squads from Cricket World Cups 1975–2023 with a 7-match knockout sim. Squad pools, player eras, and match length all change with the format.',
  },
  {
    q: 'Are the players real World Cup cricketers?',
    a: 'Yes. Every squad is built from actual World Cup tournament players — not generic names. You might draw India 2011, West Indies 1975, Australia 2007, England 2019, Afghanistan 2023, or another real edition from history.',
  },
  {
    q: 'What is Classic mode vs Almanac mode?',
    a: 'Classic mode shows player ratings and star markers so you can draft with full information. Almanac mode hides ratings — you draft purely from cricket memory, roles, and tournament knowledge. Same squads, harder challenge.',
  },
  {
    q: `How do formations work in ${BRAND.name}?`,
    a: 'Your formation sets the XI shape — wicketkeeper, openers, middle order, all-rounders, and bowlers. Options like 1-2-3-2-3 or 1-2-3-1-4 change which roles are scarce and which picks matter most during the draft.',
  },
  {
    q: 'How do rerolls work?',
    a: 'You get 2 rerolls per draft turn. Another nation draws a different country entirely. Another World Cup keeps the same nation but changes the tournament year. Use them when the squad does not solve your open positions.',
  },
  {
    q: 'How does the knockout simulation work?',
    a: 'After the draft, your XI plays knockout matches one at a time. Team strength comes from batting, bowling, balance, formation fit, play style, and a little luck. Win every match to go unbeaten. Lose once and the campaign ends.',
  },
  {
    q: 'What counts as a perfect run on the leaderboard?',
    a: 'Only unbeaten campaigns qualify for the Top 24h board — 6 wins and 0 losses in T20, or 7 wins and 0 losses in ODI. Runs are ranked by run difference, runs scored, runs conceded, XI rating, then submission time.',
  },
  {
    q: `What is the best ${BRAND.name} draft strategy?`,
    a: 'Build the spine first: wicketkeeper, openers, a balanced middle order, genuine all-rounders, then pace and spin. Do not stack famous batters if bowling slots are empty. Balance wins over a full knockout run, not one big name.',
  },
  {
    q: `Is ${BRAND.name} like fantasy cricket or Dream11?`,
    a: `${BRAND.name} is closer to a draft puzzle than daily fantasy. You are not picking a team for one real upcoming match — you are building a historical World Cup XI across eras, then simulating a fictional knockout tournament.`,
  },
  {
    q: `Who is ${BRAND.name} for?`,
    a: 'Cricket World Cup fans, fantasy players, streamers, pub-quiz lovers, and anyone who enjoys debating XIs across generations — from Viv Richards and Kapil Dev to Kohli, Stokes, and Rashid Khan.',
  },
];

const LEGEND_PICKS = [
  { name: 'Vivian Richards', nation: 'West Indies', era: '1975–1983' },
  { name: 'Sachin Tendulkar', nation: 'India', era: '1992–2011' },
  { name: 'Wasim Akram', nation: 'Pakistan', era: '1987–2003' },
  { name: 'Shane Warne', nation: 'Australia', era: '1996–2003' },
  { name: 'MS Dhoni', nation: 'India', era: '2007–2019' },
  { name: 'Glenn McGrath', nation: 'Australia', era: '1996–2007' },
  { name: 'AB de Villiers', nation: 'South Africa', era: '2007–2015' },
  { name: 'Ben Stokes', nation: 'England', era: '2015–2023' },
];

function FaqSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `${BRAND.slug}-faq-schema`;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(`${BRAND.slug}-faq-schema`)?.remove();
    };
  }, []);

  return null;
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              onClick={() => toggle(index)}
            >
              <span className="faq-question">{item.q}</span>
              <span className="faq-icon" aria-hidden="true" />
            </button>
            <div className="faq-panel" aria-hidden={!isOpen}>
              <div className="faq-panel-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GuideSections() {
  return (
    <article className="guide-wrap" id="guide">
      <FaqSchema />

      <header className="guide-intro">
        <p className="guide-kicker">
          <BrandName size="sm" /> · free cricket draft game
        </p>
        <h2 className="guide-title">{BRAND.tagline}</h2>
        <p className="guide-lead">
          {BRAND.name} is a Cricket World Cup draft challenge built for fans who know their eras.
          Roll one nation and tournament year per turn, fill eleven real slots, then chase a
          perfect 6-0 T20 run or 7-0 ODI run — one loss and you are out.
        </p>
      </header>

      <section className="guide-block" id="how-to-play">
        <h3>How to play</h3>
        <ol className="guide-flow">
          <li>
            <strong>Roll a World Cup squad</strong>
            <span>One nation, one tournament year — India 1983, Australia 2007, England 2019, and more.</span>
          </li>
          <li>
            <strong>Draft one player</strong>
            <span>Pick who fits your open roles now. Star names tempt, but formation gaps decide the draft.</span>
          </li>
          <li>
            <strong>Simulate the knockout</strong>
            <span>Complete the XI, then play through 6 T20 or 7 ODI matches. Win them all or go home.</span>
          </li>
        </ol>
      </section>

      <section className="guide-block" id="rules">
        <h3>Rules at a glance</h3>
        <ul className="guide-points">
          <li>One draw, one squad, one pick per turn — no duplicate players across the XI.</li>
          <li>2 rerolls per turn: another nation, or same nation / different World Cup year.</li>
          <li>Formation sets your shape — keeper, openers, middle order, all-rounders, bowlers.</li>
          <li>Classic mode shows ratings; Almanac mode hides them for a memory test.</li>
          <li>Knockout format: T20 = 6 matches, ODI = 7 matches. One loss ends the run.</li>
        </ul>
        <div className="guide-stats">
          <div>
            <strong>6</strong>
            <span>T20 knockout matches</span>
          </div>
          <div>
            <strong>7</strong>
            <span>ODI knockout matches</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Rerolls per turn</span>
          </div>
        </div>
      </section>

      <RoleGuide />

      <section className="guide-block" id="strategy">
        <h3>Draft smarter</h3>
        <p className="guide-copy">
          The fastest way to lose a sim is a beautiful batting line-up with no bowling spine.
          Secure scarce roles early — wicketkeeper, front-line pace, genuine spin — then fill
          middle-order depth and all-round balance.
        </p>
        <ul className="guide-points guide-points--compact">
          <li>Read empty slots before the biggest name on the squad list.</li>
          <li>ODI 1983 squads solve positions differently from T20 2024 rosters — replay both.</li>
          <li>Defensive style boosts bowling; attacking style boosts batting; balanced stays flexible.</li>
        </ul>
      </section>

      <section className="guide-block guide-block--legends" aria-label="Legendary players in the pool">
        <h3>Legends in the pool</h3>
        <p className="guide-copy">
          Real World Cup squads mean real tournament greats can land on your board — from 1975
          pioneers to modern T20 champions.
        </p>
        <ul className="legend-list">
          {LEGEND_PICKS.map((player) => (
            <li key={player.name}>
              <strong>{player.name}</strong>
              <span>
                {player.nation} · {player.era}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-block guide-block--faq" id="faq">
        <h3>Frequently asked questions</h3>
        <p className="guide-copy">
          Everything you need to know about the free Cricket World Cup draft game — formats,
          squads, simulation, leaderboard, and strategy.
        </p>
        <FaqAccordion />
      </section>
    </article>
  );
}
