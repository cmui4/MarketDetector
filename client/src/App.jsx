import { useState, useEffect, useCallback } from 'react'
import GameCard from './GameCard'
import './App.css'

const POLL_INTERVAL = 30_000

const SORT_OPTIONS = [
  { value: 'gap-desc',  label: 'Gap: High → Low' },
  { value: 'gap-asc',   label: 'Gap: Low → High' },
  { value: 'time-asc',  label: 'Time: Soonest' },
  { value: 'time-desc', label: 'Time: Latest' },
  { value: 'vol-desc',  label: 'Kalshi Volume' },
]

function sortGames(games, sort) {
  const sorted = [...games]
  switch (sort) {
    case 'gap-asc':
      return sorted.sort((a, b) => (a.discrepancy ?? -1) - (b.discrepancy ?? -1))
    case 'time-asc':
      return sorted.sort((a, b) => new Date(a.commenceTime) - new Date(b.commenceTime))
    case 'time-desc':
      return sorted.sort((a, b) => new Date(b.commenceTime) - new Date(a.commenceTime))
    case 'vol-desc':
      return sorted.sort((a, b) => (b.kalshi?.volume ?? 0) - (a.kalshi?.volume ?? 0))
    case 'gap-desc':
    default:
      return sorted.sort((a, b) => (b.discrepancy ?? -1) - (a.discrepancy ?? -1))
  }
}

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [sort, setSort] = useState('gap-desc')
  const [kalshiOnly, setKalshiOnly] = useState(false)

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

  const visibleGames = sortGames(
    kalshiOnly ? games.filter(g => g.kalshi) : games,
    sort
  )

  return (
    <div className="app">
      <div className="header">
        <h1 className="header-title">EdgeFinder</h1>
        <p className="header-sub">Sportsbook consensus vs Kalshi prediction market, sorted by discrepancy</p>

        {!loading && !error && games.length > 0 && (
          <div className="stats-bar">
            <span><strong>{games.length}</strong> games today</span>
            <span><strong>{kalshiCount}</strong> on Kalshi</span>
            {avgDiscrepancy && <span>Avg gap <strong>{avgDiscrepancy}%</strong></span>}
            {updatedStr && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Updated {updatedStr}
                <button className="refresh-btn" onClick={fetchGames}>Refresh</button>
              </span>
            )}
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

      {!loading && !error && games.length > 0 && (
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Sort</label>
            <select
              className="filter-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Show</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!kalshiOnly ? 'toggle-btn-active' : ''}`}
                onClick={() => setKalshiOnly(false)}
              >
                All games
              </button>
              <button
                className={`toggle-btn ${kalshiOnly ? 'toggle-btn-active' : ''}`}
                onClick={() => setKalshiOnly(true)}
              >
                Kalshi only
              </button>
            </div>
          </div>

          <span className="filter-count">{visibleGames.length} game{visibleGames.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="game-list">
        {visibleGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default App
