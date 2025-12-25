/// minimap.js
/// Top-down minimap for better navigation
/// Made by CCVO - CanC-Code

let minimapCanvas = null;
let minimapCtx = null;
let minimapContainer = null;

export function initMinimap() {
  // Create minimap container
  minimapContainer = document.createElement('div');
  minimapContainer.id = 'minimap-container';
  minimapContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 150px;
    height: 150px;
    background: rgba(10, 10, 26, 0.9);
    border: 2px solid #00ff88;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
    backdrop-filter: blur(10px);
    z-index: 10;
    overflow: hidden;
  `;
  
  minimapCanvas = document.createElement('canvas');
  minimapCanvas.width = 150;
  minimapCanvas.height = 150;
  minimapCanvas.style.cssText = `
    width: 100%;
    height: 100%;
    image-rendering: crisp-edges;
  `;
  
  minimapContainer.appendChild(minimapCanvas);
  document.body.appendChild(minimapContainer);
  
  minimapCtx = minimapCanvas.getContext('2d');
}

export function updateMinimap(snakePos, foodPos, doorPos, roomSize) {
  if (!minimapCtx) return;
  
  const ctx = minimapCtx;
  const width = minimapCanvas.width;
  const height = minimapCanvas.height;
  
  // Clear
  ctx.fillStyle = 'rgba(10, 10, 26, 0.5)';
  ctx.fillRect(0, 0, width, height);
  
  // Draw room bounds
  ctx.strokeStyle = '#3366cc';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Scale factor
  const scale = (width - 20) / roomSize;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw food
  if (foodPos) {
    const fx = centerX + foodPos.x * scale;
    const fy = centerY + foodPos.z * scale;
    
    // Food glow
    const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8);
    gradient.addColorStop(0, 'rgba(255, 68, 68, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 68, 68, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(fx - 8, fy - 8, 16, 16);
    
    // Food dot
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw door
  if (doorPos) {
    const dx = centerX + doorPos.x * scale;
    const dy = centerY + doorPos.z * scale;
    
    // Door glow
    const gradient = ctx.createRadialGradient(dx, dy, 0, dx, dy, 10);
    gradient.addColorStop(0, 'rgba(68, 255, 68, 0.6)');
    gradient.addColorStop(1, 'rgba(68, 255, 68, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(dx - 10, dy - 10, 20, 20);
    
    // Door marker
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(dx - 4, dy - 4, 8, 8);
  }
  
  // Draw snake
  const sx = centerX + snakePos.x * scale;
  const sy = centerY + snakePos.z * scale;
  
  // Snake glow
  const snakeGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
  snakeGradient.addColorStop(0, 'rgba(136, 255, 204, 0.8)');
  snakeGradient.addColorStop(1, 'rgba(136, 255, 204, 0)');
  ctx.fillStyle = snakeGradient;
  ctx.fillRect(sx - 10, sy - 10, 20, 20);
  
  // Snake head
  ctx.fillStyle = '#88ffcc';
  ctx.beginPath();
  ctx.arc(sx, sy, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Snake center dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sx, sy, 2, 0, Math.PI * 2);
  ctx.fill();
}

export function hideMinimap() {
  if (minimapContainer) {
    minimapContainer.style.display = 'none';
  }
}

export function showMinimap() {
  if (minimapContainer) {
    minimapContainer.style.display = 'block';
  }
}