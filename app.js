console.log("App started");

// should use clearsports api - not working rn

let gamesDiv;
let datePicker;

let lastFetchTime = 0;
const COOLDOWN = 2000; // 2 seconds
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  gamesDiv = document.getElementById("games");
  datePicker = document.getElementById("datePicker");

  // Set default date to today
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  datePicker.value = localDate;

  datePicker.addEventListener("change", () => {
    loadData();
  });

  loadData();
});

async function loadData() {
  const now = Date.now();

  if (now - lastFetchTime < COOLDOWN) {
    console.log("Skipping request (cooldown)");
    return;
  }

  // Prevents spam
  if (isLoading) return;

  isLoading = true;
  lastFetchTime = now;
    
  gamesDiv.innerHTML = "<p>Loading games...</p>";

  try {
    const oddsData = await fetchOdds();

    console.log("Odds loaded: ", oddsData);

    const filteredGames = filterGamesByDate(
      oddsData,
      datePicker.value
    );

    renderGames(filteredGames);

  } catch (e) {
    console.error("Odds failed:", e);

    gamesDiv.innerHTML = `
    <p>Failed to load games.</p>
    `;
  }

  isLoading = false;
}

// Fetch odds
async function fetchOdds() {
  const response = await fetch(
    "https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=spreads,totals,h2h&apiKey=43df2322173d88a1be8f6588fd399c7a"
  );

  console.log("Odds status:", response.status);

  const text = await response.text();
  console.log("Raw odds response:", text);

  if (!response.ok) {
    throw new Error(`Odds fetch failed: ${response.status}`);
  }

  return JSON.parse(text);
}

function getMarket(bookmaker, key) {
  return bookmaker.markets.find(
    market => market.key === key
  );
}

// Extract spread
function getMarketData(oddsGame) {
  if (!oddsGame || !oddsGame.bookmakers) return [];

  return oddsGame.bookmakers.map(book => {
    const spreadsMarket = getMarket(book, "spreads");
    const totalsMarket = getMarket(book, "totals");
    const moneylineMarket = getMarket(book, "h2h");

    // Spread
    const homeSpread = spreadsMarket?.outcomes.find(
      o => o.name === oddsGame.home_team
    );

    // Totals
    const over = totalsMarket?.outcomes.find(
      o => o.name === "Over"
    );

    const under = totalsMarket?.outcomes.find(
      o => o.name === "Under"
    );

    // Moneylines
    const homeML = moneylineMarket?.outcomes.find(
      o => o.name === oddsGame.home_team
    );

    const awayML = moneylineMarket?.outcomes.find(
      o => o.name === oddsGame.away_team
    );

    return{
      book: book.title,

      spread: homeSpread?.point,
      spreadPrice: homeSpread?.price,

      total: over?.point,
      overPrice: over?.price,
      underPrice: under?.price,

      homeML: homeML?.price,
      awayML: awayML?.price
    }
  })
}

// Helper for data filtering
function filterGamesByDate(games, selectedDate){
  return games.filter(game => {
    const gameDate = new Date(game.commence_time);
    
    const localDate = new Date(gameDate.getTime() - gameDate.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];
    
  return localDate === selectedDate;
  })
}

// Render UI
function renderGames(games) {
  gamesDiv.innerHTML = "";

  if (!games || games.length === 0) {
    gamesDiv.innerHTML = "<p>No games found.</p>";
    return;
  }

  games.forEach(game => {
    
    const odds = getMarketData(game);

    const gameEl = document.createElement("div");

    gameEl.className = "game-card";

    const oddsHtml = odds.map(o => `
      <div class="bookmaker">
        <strong>${o.book}: </strong><br>

        Spread:
        ${o.spread ?? "N/A"}
        (${o.spreadPrice ?? "N/A"})<br>

        Total:
        ${o.total ?? "N/A"}
        (O ${o.overPrice ?? "N/A"} /
        U ${o.underPrice ?? "N/A"})<br>

        ML:
        Home ${o.homeML ?? "N/A"} /
        Away ${o.awayML ?? "N/A"}

      </div>
    `).join("");

    gameEl.innerHTML = `
      <strong>${game.away_team}</strong> @
      <strong>${game.home_team}</strong> 
      <div>${oddsHtml}</div>
    `;

    gamesDiv.appendChild(gameEl);
  });
}

async function getActiveSports() {
  const response = await fetch("https://api.the-odds-api.com/v4/sports?apiKey=43df2322173d88a1be8f6588fd399c7a");
  const data = await response.json();

  // Filter only in-season sports
  const activeSports = data.filter(sport => sport.active);

  console.log(activeSports);
  return activeSports;

  const formattedSports = activeSports.map(sport => ({
  key: sport.key,
  title: sport.title
  }));

  console.log(formattedSports);
}
