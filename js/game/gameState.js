/// gameState.js
/// Central mutable game state
/// Made by CCVO - CanC-Code

export const state = {
  room: 1,
  bites: 0,
  speed: 2,
  alive: true,
  doorOpen: false,
  roomSize: 12,
  bitesPerRoom: 15
};

export function resetGameState() {
  state.room = 1;
  state.bites = 0;
  state.speed = 2;
  state.alive = true;
  state.doorOpen = false;
}

export function registerBite() {
  state.bites++;
  state.speed += 0.05;
  if (state.bites % state.bitesPerRoom === 0) {
    state.doorOpen = true;
  }
}