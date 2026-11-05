import * as THREE from "../../three/three.module.js";
import { Snake } from "./snake.js";

export class EnemySnake extends Snake {
  constructor(options) {
    super(options);
    this.turnRate = 2.2; // Slightly slower turn than player
  }

  // Overrides the base update to use AI steering
  updateAI(dt, targetPos, isBoosted) {
    const normal = this.headPos.clone().normalize();
    const toTarget = targetPos.clone().sub(this.headPos);
    
    // Project the food vector onto the tangent plane of the sphere
    const tangent = toTarget.clone().addScaledVector(normal, -toTarget.dot(normal)).normalize();
    
    // Calculate cross product to find which way to turn
    const cross = this.headDir.clone().cross(tangent);
    const turnDir = Math.sign(cross.dot(normal));
    
    // How directly are we facing the food? (1 = perfect, -1 = opposite)
    const dot = this.headDir.dot(tangent);
    
    let turnInput = 0;
    if (dot < 0.99) {
      turnInput = turnDir * Math.min(1, (1 - dot) * 2);
    }

    // Call the parent update method
    super.update(dt, turnInput, isBoosted);
  }
}
