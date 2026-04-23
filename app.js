console.log("App started");

const gamesDiv = document.getElementById("games");
const datePicker = document.getElementById("datePicker");

// Set default date to today
const today = new Date().toISOString().split("T")[0];
datePicker.value = today;

async function loadGames() {
  const selectedDate = datePicker.value || today;

  gamesDiv.innerHTML = "<p>Loading games...</p>";
  
  const response = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${selectedDate}`, {
    headers: {
      Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
    }
  });

  const data = await response.json();

  console.log(data);

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
}

loadGames();