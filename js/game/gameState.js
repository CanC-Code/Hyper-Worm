/// gameState.js
/// Purpose: Central mutable game state
/// Made by CCVO - CanC-Code

export const state = {
  room: 1,
  bites: 0,

  bitesPerRoom: 15,

  alive: true,
  doorOpen: false,
};

/* ---------- Reset Entire Run ---------- */
export function resetGameState() {
  state.room = 1;
  state.bites = 0;
  state.alive = true;
  state.doorOpen = false;
}

/* ---------- Bite Progression ---------- */
export function registerBite() {
  state.bites++;

  if (state.bites % state.bitesPerRoom === 0) {
    state.doorOpen = true;
  }
}

/* ---------- Room Progression ---------- */
export function advanceRoom() {
  state.room++;
  state.doorOpen = false;
}