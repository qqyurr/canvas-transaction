type BaseShapeConfig = {
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
}

type ParallelogramConfig = BaseShapeConfig & {
  width: number,
  height: number,
  topOffset: number
}

type CircleConfig = BaseShapeConfig & {
  radius: number
}

type TrailConfig = BaseShapeConfig & {
  radius: number,
  segments: number,
  alphaFactor: number
}

export function drawLeftHalfParallelogram(
  { ctx, x, y, width, height, topOffset, color }: ParallelogramConfig
) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2, topOffset + 50);
  ctx.lineTo(x + width / 2, topOffset + height + 50);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.fill();
}

export function drawRightHalfParallelogram(
  { ctx, x, y, width, height, topOffset, color }: ParallelogramConfig
) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y - 50);
  ctx.lineTo(x + width, topOffset);
  ctx.lineTo(x + width, topOffset + height);
  ctx.lineTo(x + width / 2, y + height - 50);
  ctx.closePath();
  ctx.fill();
}

export function drawCircle(
  { ctx, x, y, radius, color }: CircleConfig
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTrail(
  { ctx, x, y, radius, color, segments, alphaFactor }: TrailConfig
): void {
  for (let i = 0; i < segments; i++) {
    ctx.globalAlpha = alphaFactor * (30 - i);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - i * 7, y, radius - i, 0, Math.PI * 2);
    ctx.fill();
  }
}   