console.log("App started");

const gamesDiv = document.getElementById("games");

gamesDiv.innerHTML = "<p>Loading games...</p>";

async function loadGames() {
  const response = await fetch("https://api.balldontlie.io/v1/games?dates[]=2026-04-21", {
    headers: {
      Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
    }
  });

  const data = await response.json();

  console.log(data);

  gamesDiv.innerHTML = "";

  data.data.forEach(game => {
    const gameEl = document.createElement("p");
    gameEl.textContent = `${game.home_team.full_name} vs ${game.visitor_team.full_name}`;
    gamesDiv.appendChild(gameEl);
  });
}

loadGames();