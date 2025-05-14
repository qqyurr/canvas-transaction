import type { ApiData } from "../../types/types";
import { drawCircle, drawTrail } from "../canvas/shapes";

export enum Color {
  Fast = '#38b6ff',
  Normal = '#ff9800',
  Slow = '#ff6f6f',
}

type DataExecutionTime = {
  fast: number;
  normal: number;
  slow: number;
}

export interface PhaseData {
  startTime: number;
  elapsedTime: number;
  position: number;
  isActive: boolean;
  phase: 'start' | 'progress' | 'end';
  startOffset: number;
  endTime?: number;
}

export function getColorByExecutionTime(executionTime: number): string {
  return executionTime < 41 ? Color.Fast : executionTime < 81 ? Color.Normal : Color.Slow;
}

export function getDataExecutionTimeCount(apiData: ApiData[]): DataExecutionTime {
  return apiData.reduce((acc, data) => {
    if (data.executionTime <= 40) {
      acc.fast += 1;
    } else if (data.executionTime <= 80) {
      acc.normal += 1;
    } else {
      acc.slow += 1;
    }
    return acc;
  }, { fast: 0, normal: 0, slow: 0 });
}

export function getCategoryColorByCount(dataExecutionTime: DataExecutionTime, count: number): string[] {
  const totalCount = dataExecutionTime.fast + dataExecutionTime.normal + dataExecutionTime.slow;

  const fastRatio = totalCount > 0 ? dataExecutionTime.fast / totalCount : 1 / 3;
  const normalRatio = totalCount > 0 ? dataExecutionTime.normal / totalCount : 1 / 3;
  const slowRatio = totalCount > 0 ? dataExecutionTime.slow / totalCount : 1 / 3;

  let fastCount = Math.floor(count * fastRatio);
  let normalCount = Math.floor(count * normalRatio);
  let slowCount = Math.floor(count * slowRatio);

  let remain = count - (fastCount + normalCount + slowCount);
  const ratios = [
    { type: 'fast', value: fastRatio },
    { type: 'normal', value: normalRatio },
    { type: 'slow', value: slowRatio }
  ];

  ratios.sort((a, b) => b.value - a.value);
  for (let i = 0; i < remain; i++) {
    if (ratios[i % 3].type === 'fast') fastCount++;
    else if (ratios[i % 3].type === 'normal') normalCount++;
    else slowCount++;
  }

  const rectColors: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < fastCount) rectColors.push(Color.Fast);
    else if (i < fastCount + normalCount) rectColors.push(Color.Normal);
    else rectColors.push(Color.Slow);
  }

  return rectColors;
}

export function createPhaseData(data: ApiData, startTime: number): ApiData & PhaseData {
  return {
    ...data,
    startTime,
    elapsedTime: 0,
    position: 0,
    isActive: true,
    phase: 'start',
    startOffset: data.startOffset || 0
  };
}

export function updateDataItem(data: ApiData & PhaseData, deltaTime: number, now: number): void {
  if (!data.isActive) return;

  const totalElapsedTime = (data.elapsedTime || 0) + deltaTime;

  switch (data.phase) {
    case 'start':
      updateStartPhase(data, totalElapsedTime, now);
      break;
    case 'progress':
      updateProgressPhase(data, totalElapsedTime, now);
      break;
    case 'end':
      updateEndPhase(data, totalElapsedTime);
      break;
  }
}

function updateStartPhase(data: ApiData & PhaseData, totalElapsedTime: number, now: number): void {
  const requestElapsedTime = Math.max(0, totalElapsedTime - data.startOffset);
  const position = Math.min(requestElapsedTime, 1);
  const isActive = requestElapsedTime < data.executionTime;

  if (position >= 1) {
    data.phase = 'progress';
    data.elapsedTime = totalElapsedTime;
    data.isActive = true;
    data.endTime = now + data.executionTime * 1000;
  } else {
    data.elapsedTime = totalElapsedTime;
    data.position = position;
    data.isActive = isActive;
  }
}

function updateProgressPhase(data: ApiData & PhaseData, totalElapsedTime: number, now: number): void {
  const progressElapsedTime = totalElapsedTime - data.startOffset;
  const isActive = progressElapsedTime < data.executionTime;

  if (progressElapsedTime >= data.executionTime) {
    data.phase = 'end';
    data.elapsedTime = 0;
    data.position = 0;
    data.isActive = true;
    data.endTime = now;
  } else {
    data.elapsedTime = totalElapsedTime;
    data.isActive = isActive;
  }
}

function updateEndPhase(data: ApiData & PhaseData, totalElapsedTime: number): void {
  const isActive = totalElapsedTime <= 1;
  const position = Math.min(totalElapsedTime, 1);

  data.elapsedTime = totalElapsedTime;
  data.position = position;
  data.isActive = isActive;
}

export function sortDataByEndTime(data: (ApiData & PhaseData)[]): (ApiData & PhaseData)[] {
  return [...data].sort((a, b) => {
    if (a.endTime && b.endTime) return a.endTime - b.endTime;
    if (a.endTime) return -1;
    if (b.endTime) return 1;
    return 0;
  });
}

export function cleanupData(apiData: (ApiData & PhaseData)[]): (ApiData & PhaseData)[] {
  return apiData.filter(data =>
    data.isActive ||
    (data.elapsedTime <= 1 && data.phase !== 'progress')
  );
}

// Canvas utility interfaces
export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface Position {
  x: number;
  y: number;
}

export function createCanvasContext(width: number, height: number, options?: { alpha?: boolean, willChange?: boolean }): CanvasContext {
  const canvas = document.createElement('canvas');

  if (options?.willChange) {
    canvas.style.willChange = 'transform';
  }

  const ctx = canvas.getContext('2d', { alpha: options?.alpha !== false })!;
  if (!ctx) throw new Error('Failed to get canvas context');

  canvas.width = width;
  canvas.height = height;

  // Optimize rendering
  if ('imageSmoothingEnabled' in ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  return { canvas, ctx };
}

export function resetCanvas(layer: CanvasContext): void {
  if (!layer) return;

  layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
}

export function cleanupCanvasContext(layer: CanvasContext): void {
  if (!layer) return;

  // Clear context
  layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);

  // Reset canvas size
  layer.canvas.width = 0;
  layer.canvas.height = 0;

  // Clear context again after size reset
  layer.ctx.clearRect(0, 0, 0, 0);

  // Remove canvas from DOM
  layer.canvas.remove();

  // Clear any stored ImageData
  try {
    const imageData = layer.ctx.getImageData(0, 0, 0, 0);
    imageData.data.fill(0);
  } catch (e) {
    // Ignore error if context is already cleared
  }
}

export function calculateAnimatedPosition(currentPos: number, targetPos: number, speed: number): number {
  return currentPos + (targetPos - currentPos) * speed;
}

export function createCachedCircleImage(radius: number, color: string): HTMLCanvasElement {
  const canvasSize = radius * 2;
  const { canvas, ctx } = createCanvasContext(canvasSize, canvasSize);

  drawCircle({
    ctx,
    x: radius,
    y: radius,
    radius,
    color
  });

  return canvas;
}

export function createCachedTrailImage(radius: number, color: string, segments: number, alphaFactor: number): HTMLCanvasElement {
  const trailLength = radius * segments;
  const canvasWidth = radius * 2 + trailLength;
  const canvasHeight = radius * 2;

  const { canvas, ctx } = createCanvasContext(canvasWidth, canvasHeight);
  drawTrail({
    ctx,
    x: radius + trailLength / 2,
    y: radius,
    radius,
    color,
    segments,
    alphaFactor
  });

  return canvas;
}

export function drawCircleWithTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  circleImage: HTMLCanvasElement,
  trailImage: HTMLCanvasElement,
  radius: number,
  trailLength: number
): void {
  ctx.drawImage(trailImage, x - radius - trailLength / 2, y - radius);
  ctx.drawImage(circleImage, x - radius, y - radius);
}

export function copyCanvas(source: CanvasContext, target: CanvasContext): void {
  const { width, height } = target.canvas;
  target.ctx.clearRect(0, 0, width, height);
  target.ctx.drawImage(source.canvas, 0, 0);
}

export function cleanupCanvasCache(cache: Map<string, HTMLCanvasElement>): void {
  cache.forEach(canvas => {
    canvas.width = 0;
    canvas.height = 0;
  });
  cache.clear();
}

export function getColorForApiData(data: ApiData): string {
  return data.phase === 'start' ? Color.Fast : getColorByExecutionTime(data.executionTime);
}

export function calculateOffScreenStatus(
  data: ApiData,
  canvasWidth: number,
  startPhaseEndX: number,
  endPhaseStartX: number,
  offsetConfig: { START: number, PADDING: number, END: number, MARGIN: number }
): { x: number; isOffScreen: boolean } {
  let x = 0;
  let isOffScreen = false;

  if (data.phase === 'start') {
    const progress = data.position!;
    x = canvasWidth * offsetConfig.START + startPhaseEndX * progress + offsetConfig.PADDING;
    isOffScreen = progress >= 1;
  } else if (data.phase === 'progress') {
    isOffScreen = true;
  } else {
    const progress = data.position!;
    x = endPhaseStartX + offsetConfig.END + (canvasWidth - endPhaseStartX - offsetConfig.MARGIN) * progress;
    isOffScreen = progress >= 1;
  }

  if (x > startPhaseEndX + offsetConfig.MARGIN && x < endPhaseStartX) {
    isOffScreen = true;
  }

  return { x, isOffScreen };
}