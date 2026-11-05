export const gameState = {
  score: 0,
  highScore: 0,
  segCount: 12,
  playing: false,
  over: false,
  hue: 0.55,
  time: 0
};

try {
  const saved = localStorage.getItem("hyperWormHighScore");
  if (saved) gameState.highScore = parseInt(saved, 10) || 0;
} catch (_) {}

export function resetGameState() {
  gameState.score = 0;
  gameState.segCount = 12;
  gameState.over = false;
  gameState.hue = 0.55;
  gameState.time = 0;
}

export function addScore(points) {
  gameState.score += points;
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    try { localStorage.setItem("hyperWormHighScore", String(gameState.highScore)); } catch (_) {}
  }
}
