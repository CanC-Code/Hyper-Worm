///// gameState.js
///// Central mutable game state with progression system
///// CCVO - CanC-Code

export const gameState = {
  room: 1,
  bites: 0,
  speed: 3,
  alive: true,
  doorOpen: false,
  roomSize: 12,
  bitesPerRoom: 10,
  totalScore: 0,
  highScore: 0,

  // --- Growth tuning ---
  snakeLength: 2.2,
  lengthPerBite: 0.6,
  lengthPerRoom: 1.5
};

// --------------------------------------------------
// High score persistence
// --------------------------------------------------

try {
  const saved = localStorage.getItem("hyperWormHighScore");
  if (saved) {
    gameState.highScore = parseInt(saved, 10) || 0;
  }
} catch (_) {}

// --------------------------------------------------
// Reset
// --------------------------------------------------

export function resetGameState() {
  gameState.room = 1;
  gameState.bites = 0;
  gameState.speed = 3;
  gameState.alive = true;
  gameState.doorOpen = false;
  gameState.roomSize = 12;
  gameState.totalScore = 0;

  gameState.snakeLength = 2.2;
}

// --------------------------------------------------
// Bite progression
// --------------------------------------------------

export function registerBite() {
  gameState.bites++;
  gameState.totalScore += 10 * gameState.room;

  // Grow snake declaratively
  gameState.snakeLength += gameState.lengthPerBite;

  // High score
  if (gameState.totalScore > gameState.highScore) {
    gameState.highScore = gameState.totalScore;
    try {
      localStorage.setItem(
        "hyperWormHighScore",
        gameState.highScore.toString()
      );
    } catch (_) {}
  }

  // Room completion
  if (gameState.bites % gameState.bitesPerRoom === 0) {
    gameState.doorOpen = true;
  }
}

// --------------------------------------------------
// Room progression
// --------------------------------------------------

export function advanceRoom() {
  gameState.room++;
  gameState.doorOpen = false;
  gameState.speed += 0.35;

  // Bonus length for survival
  gameState.snakeLength += gameState.lengthPerRoom;
}