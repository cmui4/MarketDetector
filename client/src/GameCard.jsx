function getBadgeClass(discrepancy) {
  if (discrepancy === null) return 'badge badge-none'
  if (discrepancy >= 8) return 'badge badge-fire'
  if (discrepancy >= 5) return 'badge badge-high'
  if (discrepancy >= 2) return 'badge badge-medium'
  return 'badge badge-low'
}

function ProbBar({ awayTeam, homeTeam, awayRaw, homeRaw, label, meta, color }) {
  const awayPct = (awayRaw * 100).toFixed(1)
  const homePct = (homeRaw * 100).toFixed(1)

  const awayFill = color === 'blue'
    ? 'linear-gradient(90deg, #1d4ed8, #3b82f6)'
    : 'linear-gradient(90deg, #6d28d9, #8b5cf6)'

  const homeFill = color === 'blue'
    ? 'linear-gradient(90deg, #1d4ed8, #3b82f6)'
    : 'linear-gradient(90deg, #6d28d9, #8b5cf6)'

  return (
    <div className="prob-bar-group">
      <div className="prob-bar-top-row">
        <div className="prob-bar-label-block">
          <span className="source-label">{label}</span>
          <span className="source-meta">{meta}</span>
        </div>
        <div className="prob-bar-percentages">
          <span className="prob-away">{awayTeam.split(' ').pop()} {awayPct}%</span>
          <span className="prob-home">{homePct}% {homeTeam.split(' ').pop()}</span>
        </div>
      </div>
      <div className="prob-bar-track">
        <div style={{ width: `${awayPct}%`, background: awayFill, height: '100%' }} />
        <div style={{ width: `${homePct}%`, background: homeFill, height: '100%' }} />
      </div>
    </div>
  )
}

function GameCard({ game }) {
  const date = new Date(game.commenceTime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const hasKalshi = game.kalshi !== null

  return (
    <div className="game-card">
      <div className="card-header">
        <div>
          <div className="matchup-teams">
            {game.awayTeam} <span className="matchup-at">@</span> {game.homeTeam}
          </div>
          <div className="matchup-time">{date}</div>
        </div>
        <div className={getBadgeClass(game.discrepancy)}>
          {game.discrepancy !== null ? `${game.discrepancy}% gap` : 'No Kalshi'}
        </div>
      </div>

      <div className="bars-stack">
        <ProbBar
          awayTeam={game.awayTeam}
          homeTeam={game.homeTeam}
          awayRaw={game.consensus.awayRaw}
          homeRaw={game.consensus.homeRaw}
          label="Books"
          meta={`${game.bookCount} books · vig removed`}
          color="blue"
        />

        {hasKalshi ? (
          <ProbBar
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
            awayRaw={game.kalshi.awayRaw}
            homeRaw={game.kalshi.homeRaw}
            label="Kalshi"
            meta={`Vol: ${(game.kalshi.volume / 1000).toFixed(0)}K`}
            color="purple"
          />
        ) : (
          <div className="no-kalshi">No Kalshi market found</div>
        )}
      </div>
    </div>
  )
}

export default GameCard
