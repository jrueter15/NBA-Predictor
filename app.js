console.log("App started");

let gamesDiv;
let datePicker;
let today;

document.addEventListener("DOMContentLoaded", () => {
  gamesDiv = document.getElementById("games");
  datePicker = document.getElementById("datePicker");

  // Set default date to today
  today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  datePicker.value = localDate;

  datePicker.addEventListener("change", loadGames);

  loadGames();
});

async function loadGames() {
  const selectedDate = datePicker.value;

  gamesDiv.innerHTML = "<p>Loading games...</p>";
  
  try{
  const response = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${selectedDate}`, {
    headers: {
      Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
    }
  });

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
    gameEl.textContent = `${game.home_team.full_name} vs ${game.visitor_team.full_name}`;
    gamesDiv.appendChild(gameEl);
  });

} catch (error){
  console.error(error);
  gamesDiv.innerHTML = "<p>Error loading games. Try again</p>";
}
}