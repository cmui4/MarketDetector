import { useState, useEffect, useCallback } from 'react'
import GameCard from './GameCard'
import './App.css'

const POLL_INTERVAL = 30_000

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchGames = useCallback(() => {
    fetch('http://localhost:3001/api/combined/nba')
      .then(res => res.json())
      .then(data => {
        setGames(data)
        setLoading(false)
        setError(null)
        setLastUpdated(new Date())
      })
      .catch(() => {
        setLoading(false)
        setError('Failed to fetch data')
      })
  }, [])

  useEffect(() => {
    fetchGames()
    const interval = setInterval(fetchGames, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchGames])

  const kalshiCount = games.filter(g => g.kalshi).length
  const avgDiscrepancy = kalshiCount
    ? (games.reduce((sum, g) => sum + (g.discrepancy || 0), 0) / kalshiCount).toFixed(1)
    : null

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="app">
      <div className="header">
        <h1 className="header-title">Market Inefficiency Detector</h1>
        <p className="header-sub">Sportsbook consensus vs Kalshi prediction market, sorted by discrepancy</p>

        {!loading && !error && games.length > 0 && (
          <div className="stats-bar">
            <span><strong>{games.length}</strong> games today</span>
            <span><strong>{kalshiCount}</strong> on Kalshi</span>
            {avgDiscrepancy && <span>Avg gap <strong>{avgDiscrepancy}%</strong></span>}
            {updatedStr && <span style={{ marginLeft: 'auto' }}>Updated {updatedStr}</span>}
          </div>
        )}
      </div>

      {loading && (
        <div className="state-center">
          <div className="spinner" />
          <span>Fetching odds...</span>
        </div>
      )}

      {error && (
        <div className="state-center">
          <span className="error-text">{error}</span>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="state-center">
          <span>No games found. NBA may be in offseason.</span>
        </div>
      )}

      <div className="game-list">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default App
