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
    "https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=spreads&apiKey=43df2322173d88a1be8f6588fd399c7a"
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

// Extract spread
function getAllSpreads(oddsGame) {
  if (!oddsGame || !oddsGame.bookmakers) return [];

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
    const spreads = getAllSpreads(oddsGame);

    const gameEl = document.createElement("div");

    gameEl.style.backgroundColor = "#f2f4ff";
    gameEl.style.padding = "10px";
    gameEl.style.borderRadius = "8px";
    gameEl.style.marginBottom = "10px";
    gameEl.style.border = "1px solid #ccc";

    const spreadsHtml = spreads.map(s => `
      <div>
        ${s.book}: ${s.spread} (${s.price})
      </div>
    `).join("");

    gameEl.innerHTML = `
      <strong>${game.visitor_team.full_name}</strong> @
      <strong>${game.home_team.full_name}</strong> 
      <div>Spread: ${spreadsHtml}</div>
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

