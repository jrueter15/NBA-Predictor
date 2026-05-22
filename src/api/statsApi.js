export async function getTeamGames(teamId) {

  const response = await fetch(
    `https://api.balldontlie.io/v1/games?team_ids[]=${teamId}&per_page=10`,
  
    {
        headers: {
            Authorization: "967cad06-3656-41eb-b53f-05cd5cfcc252"
        }
    }
);

  const data = await response.json();

  return data.data;
}