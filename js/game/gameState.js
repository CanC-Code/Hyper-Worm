export const state = {
  room: 1,
  bites: 0,
  speed: 6,
  gridSize: 1,
  roomSize: 12,
  bitesPerRoom: 15,
  alive: true,
  doorOpen: false
};

export function resetGameState() {
  state.room = 1;
  state.bites = 0;
  state.speed = 6;
  state.alive = true;
  state.doorOpen = false;
}

export function registerBite() {
  state.bites++;
  state.speed += 0.3;
  if (state.bites % state.bitesPerRoom === 0) state.doorOpen = true;
}

export function advanceRoom() {
  state.room++;
  state.speed += 1;
  state.doorOpen = false;
}