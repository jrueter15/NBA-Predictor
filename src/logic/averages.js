export function calculateAveragePoints(
  games,
  teamName
) {

  let totalPoints = 0;

  games.forEach(game => {

    const isHome =
      game.home_team.full_name === teamName;

    if (isHome) {
      totalPoints += game.home_team_score;
    } else {
      totalPoints += game.visitor_team_score;
    }

  });

  return (
    totalPoints / games.length
  ).toFixed(1);
}