import type { GameMode, Player, Squad } from '../types';
import { formatRoles } from '../utils/format';
import {
  getPlayerBattingStat,
  getPlayerBowlingStat,
  getPlayerFlexLabel,
  getPlayerImpactStat,
  getPlayerPrimaryLabel,
} from '../utils/playerStats';

interface PlayerStatCardProps {
  player: Player;
  squad: Squad;
  mode: GameMode;
  isStar?: boolean;
  isSelected?: boolean;
}

function StatBar({ label, value, hidden }: { label: string; value: number; hidden: boolean }) {
  return (
    <div className="player-stat-bar">
      <div className="player-stat-bar-head">
        <span>{label}</span>
        <strong className={hidden ? 'player-stat-hidden' : ''}>{hidden ? '??' : value}</strong>
      </div>
      <div className="player-stat-bar-track">
        <span
          className={`player-stat-bar-fill ${hidden ? 'player-stat-bar-fill--hidden' : ''}`}
          style={{ width: hidden ? '55%' : `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PlayerStatCard({ player, squad, mode, isStar, isSelected }: PlayerStatCardProps) {
  const hidden = mode === 'almanac';
  const batting = getPlayerBattingStat(player);
  const bowling = getPlayerBowlingStat(player);
  const impact = getPlayerImpactStat(player);

  return (
    <article
      className={[
        'player-stat-card',
        isStar ? 'player-stat-card--star' : '',
        isSelected ? 'player-stat-card--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${player.name} player stats`}
    >
      <div className="player-stat-card-top">
        <div className="player-stat-card-id">
          <span className="player-stat-card-num">#{player.number}</span>
          <div>
            <h3 className="player-stat-card-name">{player.name}</h3>
            <p className="player-stat-card-squad">
              {squad.flag} {squad.nation} · {squad.tournament} {squad.year}
            </p>
          </div>
        </div>
        <div className={`player-stat-card-rating ${hidden ? 'player-stat-hidden' : ''}`}>
          {hidden ? '??' : player.rating}
        </div>
      </div>

      <div className="player-stat-card-meta">
        <span className="player-stat-card-role">{formatRoles(player.roles)}</span>
        {isStar && mode === 'classic' && (
          <span className="player-stat-card-star">★ Squad star</span>
        )}
      </div>

      <div className="player-stat-card-stats">
        <StatBar label="Batting" value={batting} hidden={hidden} />
        <StatBar label="Bowling" value={bowling} hidden={hidden} />
        <StatBar label="Impact" value={impact} hidden={hidden} />
      </div>

      <div className="player-stat-card-foot">
        <span>
          <strong>{getPlayerPrimaryLabel(player)}</strong>
        </span>
        <span>{getPlayerFlexLabel(player.roles)}</span>
      </div>
    </article>
  );
}
