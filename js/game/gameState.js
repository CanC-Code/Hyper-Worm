/// gameState.js
/// Central mutable game state with progression system
/// CCVO - CanC-Code

export const state = {
  room: 1,
  bites: 0,
  speed: 3,
  alive: true,
  doorOpen: false,
  roomSize: 12,
  bitesPerRoom: 10,
  totalScore: 0,
  highScore: 0,

  // --- NEW: growth tuning ---
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
    state.highScore = parseInt(saved, 10) || 0;
  }
} catch (_) {}

// --------------------------------------------------
// Reset
// --------------------------------------------------

export function resetGameState() {
  state.room = 1;
  state.bites = 0;
  state.speed = 3;
  state.alive = true;
  state.doorOpen = false;
  state.roomSize = 12;
  state.totalScore = 0;

  state.snakeLength = 2.2;
}

// --------------------------------------------------
// Bite progression
// --------------------------------------------------

export function registerBite() {
  state.bites++;
  state.totalScore += 10 * state.room;

  // Grow snake declaratively
  state.snakeLength += state.lengthPerBite;

  // High score
  if (state.totalScore > state.highScore) {
    state.highScore = state.totalScore;
    try {
      localStorage.setItem(
        "hyperWormHighScore",
        state.highScore.toString()
      );
    } catch (_) {}
  }

  // Room completion
  if (state.bites % state.bitesPerRoom === 0) {
    state.doorOpen = true;
  }
}

// --------------------------------------------------
// Room progression
// --------------------------------------------------

export function advanceRoom() {
  state.room++;
  state.doorOpen = false;
  state.speed += 0.35;

  // Bonus length for survival
  state.snakeLength += state.lengthPerRoom;
}