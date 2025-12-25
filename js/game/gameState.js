/// gameState.js
/// Central mutable game state with progression system - ENHANCED
/// Made by CCVO - CanC-Code

export const state = {
  room: 1,
  bites: 0,
  speed: 3,
  alive: true,
  doorOpen: false,
  roomSize: 12,
  bitesPerRoom: 10,
  totalScore: 0,
  highScore: 0
};

// Load high score from localStorage if available
try {
  const saved = localStorage.getItem('hyperWormHighScore');
  if (saved) {
    state.highScore = parseInt(saved, 10) || 0;
  }
} catch (e) {
  // localStorage not available
}

export function resetGameState() {
  state.room = 1;
  state.bites = 0;
  state.speed = 3;
  state.alive = true;
  state.doorOpen = false;
  state.roomSize = 12;
  state.totalScore = 0;
}

export function registerBite() {
  state.bites++;
  state.totalScore += 10 * state.room; // Higher rooms = more points
  
  // Update high score
  if (state.totalScore > state.highScore) {
    state.highScore = state.totalScore;
    try {
      localStorage.setItem('hyperWormHighScore', state.highScore.toString());
    } catch (e) {
      // localStorage not available
    }
  }
  
  // Check if door should open
  if (state.bites % state.bitesPerRoom === 0) {
    state.doorOpen = true;
  }
}