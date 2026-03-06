function ProbabilityBar({ homeTeam, awayTeam, homeProb, awayProb }) {
  const homeWidth = (homeProb * 100).toFixed(1)
  const awayWidth = (awayProb * 100).toFixed(1)

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
        <span>{awayTeam}: {awayWidth}%</span>
        <span>{homeTeam}: {homeWidth}%</span>
      </div>
      <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#7a7a7a' }}>
        <div style={{ width: `${awayWidth}%`, background: '#3b82f6' }} />
        <div style={{ width: `${homeWidth}%`, background: '#ef4444' }} />
      </div>
    </div>
  )
}

function GameCard({ game }) {
  const date = new Date(game.commenceTime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{
      border: '1px solid #ffffff',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      color: '#111827'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          {game.awayTeam} @ {game.homeTeam}
        </h2>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{date}</span>
      </div>
      <ProbabilityBar
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
        homeProb={game.consensus.homeRaw}
        awayProb={game.consensus.awayRaw}
      />
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
        Consensus across {game.bookCount} sportsbook{game.bookCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default GameCard
