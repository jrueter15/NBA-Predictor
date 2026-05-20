export function generateTotalInsight(game) {
  const projectedTotal =
    game.homeAvgPoints +
    game.awayAvgPoints;

  let lean = "UNDER";

  if (projectedTotal > game.total) {
    lean = "OVER";
  }

  return {
    projectedTotal,
    lean
  };
}