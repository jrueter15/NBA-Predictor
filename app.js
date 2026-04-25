console.log("App started");

let gamesDiv;
let datePicker;
let today;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  gamesDiv = document.getElementById("games");
  datePicker = document.getElementById("datePicker");

  // Set default date to today
  today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  datePicker.value = localDate;

  // Removing for now to try to fix 429 issue
  //datePicker.addEventListener("change", loadGames);
  // it works now but can't change the date

  loadGames();
});

let lastFetchTime = 0;
const COOLDOWN = 15000; // 15 seconds

async function loadGames() {
  const now = Date.now();

  if (now - lastFetchTime < COOLDOWN) {
    console.log("Skipping request (cooldown)");
    return;
  }

  lastFetchTime = now;
    
  // Prevents spam
  if (isLoading) return;
  isLoading = true;
  
  const selectedDate = datePicker.value;

  console.log("Loading games...");
  gamesDiv.innerHTML = "<p>Loading games...</p>";
  
  try{
  const response = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${selectedDate}`, {
    headers: {
      Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
    }
  });

  if (response.status === 429){
    throw new Error("Rate limited");
  }

  if (!response.ok){
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  gamesDiv.innerHTML = "";

  if (data.data.length === 0) {
    gamesDiv.innerHTML = "<p>No games found for this date.</p>";
    return;
  }

  data.data.forEach(game => {
    const gameEl = document.createElement("p");

    // Styling
    gameEl.style.backgroundColor = "#f2f4ff";
    gameEl.style.padding = "10px";
    gameEl.style.borderRadius = "8px";
    gameEl.style.marginBottom = "10px";
    gameEl.style.padding = "8px";
    gameEl.style.border = "1px solid #ccc";

    gameEl.textContent = `${game.home_team.full_name} vs ${game.visitor_team.full_name}`;
    gamesDiv.appendChild(gameEl);
  });

} catch (error){
  console.error(error);

  if (error.message.includes("429")){
    gamesDiv.innerHTML = "<p>Too many requests. Wait a few seconds and try again.</p>";
  } else{
    gamesDiv.innerHTML = "<p>Error loading games. Try again</p>";
  }
}
isLoading = false;

}