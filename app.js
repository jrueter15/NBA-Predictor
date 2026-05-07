console.log("App started");

// should use clearsports api - not working rn
// currently using api

let gamesDiv;
let datePicker;

let lastFetchTime = 0;
const COOLDOWN = 15000; // 15 seconds
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  gamesDiv = document.getElementById("games");
  datePicker = document.getElementById("datePicker");

  // Set default date to today
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  datePicker.value = localDate;

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

  let gamesData = [];
  let oddsData = [];

  try {
    gamesData = await fetchGames();
    console.log("Games loaded:", gamesData);
  } catch (e) {
    console.error("Games failed:", e);
  }

  try {
    oddsData = await fetchOdds();
    console.log("Odds loaded:", oddsData);
  } catch (e) {
    console.error("Odds failed:", e);
  }

  renderGames(gamesData, oddsData);

  isLoading = false;
}

// Fetch games (keep current API for now)
async function fetchGames() {
  const selectedDate = datePicker.value;

  const response = await fetch(
    `https://api.balldontlie.io/v1/games?dates[]=${selectedDate}`,
    {
      headers: {
        Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
      }
    }
  );

  if (!response.ok){
    throw new Error("Games fetch failed");
  } 

const data = await response.json();
  return data.data;
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

// Match game to odds
function findOdds(game, oddsData) {
  return oddsData.find(o =>
    o.home_team === game.home_team.full_name &&
    o.away_team === game.visitor_team.full_name
  );
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
      o => o.name === oddsGame.home_team
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

  const results = [];

  oddsGame.bookmakers.forEach(book => {
    const market = book.markets.find(m => m.key === "spreads");
    if (!market) return;

    const home = market.outcomes.find(
      o => o.name === oddsGame.home_team
    );

    if (!home) return;

    results.push({
      book: book.title,
      spread: home.point,
      price: home.price
    });
  })

  return results;
}

// Render UI
function renderGames(games, oddsData) {
  gamesDiv.innerHTML = "";

  if (!games || games.length === 0) {
    gamesDiv.innerHTML = "<p>No games found.</p>";
    return;
  }

  games.forEach(game => {
    const oddsGame = findOdds(game, oddsData);
    
    const odds = getMarketData(oddsGame);

    const gameEl = document.createElement("div");

    gameEl.style.backgroundColor = "#f2f4ff";
    gameEl.style.padding = "10px";
    gameEl.style.borderRadius = "8px";
    gameEl.style.marginBottom = "10px";
    gameEl.style.border = "1px solid #ccc";

    const gameTime = new Date(game.date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    const oddsHtml = odds.map(o => `
      <div style="margin-top: 6px;">
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
      <div>${gameTime}</div>  
      <strong>${game.visitor_team.full_name}</strong> @
      <strong>${game.home_team.full_name}</strong> 
      <div>Spread: ${oddsHtml}</div>
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

