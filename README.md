# EdgeFinder

A full-stack web application that identifies pricing discrepancies between traditional sportsbooks and Kalshi prediction markets for NBA games. By comparing vig-removed consensus odds from multiple sportsbooks against real-money prediction market prices, EdgeFinder surfaces potential arbitrage opportunities and market inefficiencies in real time.

---

## What It Does

Traditional sportsbooks and prediction markets often price the same event differently. EdgeFinder aggregates NBA moneyline odds from up to 12+ sportsbooks, removes the bookmaker's margin (vig), and computes a fair-value consensus probability. It then compares that consensus against Kalshi's prediction market price for the same game and surfaces the gap — the "edge."

Games are ranked by discrepancy size so the largest mispricings appear first. Each game card shows:

- **Sportsbook consensus** — average implied probability across all books, vig-removed
- **Kalshi market price** — mid-price between best bid and ask
- **Discrepancy** — the percentage gap between the two sources, color-coded by severity
- **Per-book breakdown** — expandable table showing every sportsbook's raw American odds and vig-removed probability

Data refreshes automatically every 30 seconds and can be manually refreshed at any time.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | Component-based UI, state management with `useState`/`useEffect`/`useCallback` |
| Vite 7 | Development server and production bundler |
| Vanilla CSS | All styling — no UI library dependencies |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | REST API server |
| node-fetch | Server-side HTTP requests to external APIs |
| dotenv | Environment variable management for API keys |
| cors | Cross-origin resource sharing for local dev |

### External APIs
| API | Usage |
|---|---|
| [The Odds API](https://the-odds-api.com) | Live NBA moneyline odds from 12+ US sportsbooks in American odds format |
| [Kalshi Trade API](https://kalshi.com/docs/api) | Real-money prediction market prices for NBA game winner contracts |

---

## Key Technical Details

### Vig Removal
Raw sportsbook odds include a bookmaker margin (vig) that inflates implied probabilities above 100%. EdgeFinder removes the vig using normalization:

```
implied_prob = |odds| / (|odds| + 100)          // for negative odds
implied_prob = 100 / (odds + 100)                // for positive odds

vig_removed_home = implied_home / (implied_home + implied_away)
vig_removed_away = implied_away / (implied_home + implied_away)
```

The consensus is the average vig-removed probability across all available books.

### Kalshi Team Mapping
Kalshi's `yes_sub_title` field specifies which team the "yes" outcome represents — this is not always the home team. EdgeFinder reads this field to correctly assign probabilities regardless of market framing, preventing mislabeled odds.

### Real-Time Polling
The frontend polls `/api/combined/nba` every 30 seconds using `setInterval` inside a `useEffect` with proper cleanup. This keeps Kalshi data live as markets open closer to tip-off, without requiring a page reload.

### Market Matching
Kalshi market titles follow the pattern `"[Away] at [Home] Winner?"`. A regex parser extracts city names which are mapped to full team names via a lookup table, then matched against sportsbook game records by home/away team pair.

---

## Features

- **Discrepancy ranking** — games sorted by gap size (largest edge first) by default
- **Sort controls** — re-sort by gap (high/low), game time (soonest/latest), or Kalshi volume
- **Kalshi filter** — toggle to show only games with active Kalshi markets
- **Per-book table** — expandable breakdown showing each sportsbook's American odds and vig-removed probability
- **Auto-refresh** — 30-second polling with last-updated timestamp and manual refresh button
- **Null-safe rendering** — games without a Kalshi match are still shown with a placeholder, and populate automatically on the next poll once a market opens

---

## Project Structure

```
MarketDetector/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── App.jsx          # Root component, data fetching, filtering/sorting
│       ├── App.css          # All application styles
│       ├── GameCard.jsx     # Game card with probability bars and book breakdown
│       └── index.css        # CSS reset
└── server/                  # Express backend
    ├── index.js             # API routes and data aggregation logic
    └── utils.js             # Odds math, vig removal, team name parsing
```

---

## Running Locally

**Prerequisites:** Node.js 18+, an API key from [The Odds API](https://the-odds-api.com)

```bash
# Backend
cd server
echo "ODDS_API_KEY=your_key_here" > .env
npm install
npm run dev        # runs on port 3001

# Frontend (separate terminal)
cd client
npm install
npm run dev        # runs on port 5173
```

Open `http://localhost:5173`.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/combined/nba` | All NBA games with sportsbook consensus, Kalshi data, and discrepancy — primary endpoint |
| `GET /api/odds/nba` | Sportsbook consensus only |
| `GET /api/kalshi/nba` | Raw Kalshi markets only |
