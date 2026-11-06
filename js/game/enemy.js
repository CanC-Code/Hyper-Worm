import * as THREE from "../../three/three.module.js";
import { Snake } from "./snake.js";

export class EnemySnake extends Snake {
  constructor(options) {
    super(options);
    this.turnRate = 2.2; 
  }

  updateAI(dt, targetPos, isBoosted) {
    const toTarget = targetPos.clone().sub(this.headPos);
    toTarget.y = 0; // Ignore height
    toTarget.normalize();
    
    const cross = this.headDir.clone().cross(toTarget);
    const turnDir = Math.sign(cross.y); // Turn left or right
    
    const dot = this.headDir.dot(toTarget);
    let turnInput = 0;
    if (dot < 0.99) turnInput = turnDir * Math.min(1, (1 - dot) * 2);

    super.update(dt, turnInput, isBoosted);
  }
}
