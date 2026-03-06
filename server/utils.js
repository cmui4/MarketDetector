export function americanToImplied(odds) {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

export function removeVig(homeImplied, awayImplied) {
  const total = homeImplied + awayImplied;
  return {
    home: homeImplied / total,
    away: awayImplied / total
  };
}

export function formatPercent(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}

export const NBA_CITY_MAP = {
  'Atlanta': 'Atlanta Hawks',
  'Boston': 'Boston Celtics',
  'Brooklyn': 'Brooklyn Nets',
  'Charlotte': 'Charlotte Hornets',
  'Chicago': 'Chicago Bulls',
  'Cleveland': 'Cleveland Cavaliers',
  'Dallas': 'Dallas Mavericks',
  'Denver': 'Denver Nuggets',
  'Detroit': 'Detroit Pistons',
  'Golden State': 'Golden State Warriors',
  'Houston': 'Houston Rockets',
  'Indiana': 'Indiana Pacers',
  'Los Angeles C': 'Los Angeles Clippers',
  'Los Angeles L': 'Los Angeles Lakers',
  'Memphis': 'Memphis Grizzlies',
  'Miami': 'Miami Heat',
  'Milwaukee': 'Milwaukee Bucks',
  'Minnesota': 'Minnesota Timberwolves',
  'New Orleans': 'New Orleans Pelicans',
  'New York': 'New York Knicks',
  'Oklahoma City': 'Oklahoma City Thunder',
  'Orlando': 'Orlando Magic',
  'Philadelphia': 'Philadelphia 76ers',
  'Phoenix': 'Phoenix Suns',
  'Portland': 'Portland Trail Blazers',
  'Sacramento': 'Sacramento Kings',
  'San Antonio': 'San Antonio Spurs',
  'Toronto': 'Toronto Raptors',
  'Utah': 'Utah Jazz',
  'Washington': 'Washington Wizards'
}

export function parseKalshiTitle(title) {
  // "Dallas at Orlando Winner?" -> { away: "Dallas Mavericks", home: "Orlando Magic" }
  const match = title.match(/^(.+?) at (.+?) Winner\?$/);
  if (!match) return null;

  const awayCity = match[1].trim();
  const homeCity = match[2].trim();

  return {
    away: NBA_CITY_MAP[awayCity] || awayCity,
    home: NBA_CITY_MAP[homeCity] || homeCity
  };
}