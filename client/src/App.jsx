import { useState, useEffect } from 'react'
import GameCard from './GameCard'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/odds/nba')
      .then(res => res.json())
      .then(data => {
        setGames(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch odds')
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        Market Inefficiency Detector
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        Consensus sportsbook probabilities with vig removed
      </p>

      {loading && <p>Loading odds...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && games.length === 0 && (
        <p style={{ color: '#6b7280' }}>No games found. NBA may be in offseason.</p>
      )}
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}

export default App