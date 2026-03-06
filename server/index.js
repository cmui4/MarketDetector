import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { americanToImplied, removeVig, formatPercent, parseKalshiTitle, NBA_CITY_MAP } from './utils.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

function processGame(game) {
  const bookmakers = game.bookmakers;
  if (!bookmakers || bookmakers.length === 0) return null;

  // Average implied probabilities across all books
  let homeProbSum = 0;
  let awayProbSum = 0;
  const books = [];

  bookmakers.forEach(book => {
    const market = book.markets.find(m => m.key === 'h2h');
    if (!market) return;

    const homeOutcome = market.outcomes.find(o => o.name === game.home_team);
    const awayOutcome = market.outcomes.find(o => o.name === game.away_team);
    if (!homeOutcome || !awayOutcome) return;

    const homeImplied = americanToImplied(homeOutcome.price);
    const awayImplied = americanToImplied(awayOutcome.price);
    const vigRemoved = removeVig(homeImplied, awayImplied);

    homeProbSum += vigRemoved.home;
    awayProbSum += vigRemoved.away;

    books.push({
      name: book.title,
      awayOdds: awayOutcome.price,
      homeOdds: homeOutcome.price,
      awayProb: vigRemoved.away,
      homeProb: vigRemoved.home,
    });
  });

  if (books.length === 0) return null;

  const consensusHome = homeProbSum / books.length;
  const consensusAway = awayProbSum / books.length;

  return {
    id: game.id,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    commenceTime: game.commence_time,
    consensus: {
      home: formatPercent(consensusHome),
      away: formatPercent(consensusAway),
      homeRaw: consensusHome,
      awayRaw: consensusAway
    },
    bookCount: books.length,
    books
  };
}

app.get('/api/odds/nba', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american`
    );
    const data = await response.json();
    const processed = data
      .map(processGame)
      .filter(Boolean);
    res.json(processed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

app.get('/api/kalshi/nba', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.elections.kalshi.com/trade-api/v2/markets?status=open&series_ticker=KXNBAGAME&limit=100'
    );
    const data = await response.json();

    const markets = data.markets.map(market => ({
      ticker: market.ticker,
      title: market.title,
      yesTeam: market.yes_sub_title,
      yesProbability: ((market.yes_bid + market.yes_ask) / 2) / 100,
      noProbability: 1 - ((market.yes_bid + market.yes_ask) / 2) / 100,
      volume: market.volume
    }));

    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Kalshi markets' });
  }
});

app.get('/api/combined/nba', async (req, res) => {
  try {
    const [oddsResponse, kalshiResponse] = await Promise.all([
      fetch(`https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american`),
      fetch('https://api.elections.kalshi.com/trade-api/v2/markets?status=open&series_ticker=KXNBAGAME&limit=100')
    ]);

    const oddsData = await oddsResponse.json();
    const kalshiData = await kalshiResponse.json();

    // Build a lookup map of Kalshi markets by home and away team
    const kalshiMap = {};
    kalshiData.markets.forEach(market => {
      const teams = parseKalshiTitle(market.title);
      if (!teams) return;

      const key = `${teams.away}|${teams.home}`;
      const yesMidpoint = ((market.yes_bid + market.yes_ask) / 2) / 100;

      // yes_sub_title tells us which team "yes" represents (can be home or away)
      const yesCity = market.yes_sub_title;
      const yesTeam = NBA_CITY_MAP[yesCity] || yesCity;
      const yesIsHome = yesTeam === teams.home;

      kalshiMap[key] = {
        yesProbability: yesMidpoint,
        volume: market.volume,
        ticker: market.ticker,
        yesIsHome
      };
    });

    // Process sportsbook games and attach Kalshi data
    const combined = oddsData.map(game => {
      const processed = processGame(game);
      if (!processed) return null;

      const key = `${game.away_team}|${game.home_team}`;
      const kalshi = kalshiMap[key];

      if (!kalshi) {
        return { ...processed, kalshi: null, discrepancy: null };
      }

      // Use yesIsHome to correctly map yes probability to home or away
      const kalshiHomeProb = kalshi.yesIsHome ? kalshi.yesProbability : 1 - kalshi.yesProbability;
      const kalshiAwayProb = 1 - kalshiHomeProb;
      const discrepancy = Math.abs(kalshiHomeProb - processed.consensus.homeRaw);

      return {
        ...processed,
        kalshi: {
          homeProb: formatPercent(kalshiHomeProb),
          awayProb: formatPercent(kalshiAwayProb),
          homeRaw: kalshiHomeProb,
          awayRaw: kalshiAwayProb,
          volume: kalshi.volume,
          ticker: kalshi.ticker
        },
        discrepancy: parseFloat((discrepancy * 100).toFixed(1))
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.discrepancy || 0) - (a.discrepancy || 0));

    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});