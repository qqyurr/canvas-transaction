import type { ApiData } from '../../types/types';
import { RECT_CONFIG } from './config';
import {
  calculateAnimatedPosition,
  getDataExecutionTimeCount,
  getCategoryColorByCount
} from '$lib/utils/utils';
import { drawLeftHalfParallelogram, drawRightHalfParallelogram } from './shapes';

const RECT_LAYER_CONFIG = {
  ANIMATION_SPEED: 0.005,
  MAX_RECTANGLES: 15,
  BASE_DATA_PER_RECTANGLE: 100,
  VERTICAL_OFFSET: 100
} as const;

interface Position {
  x: number;
  y: number;
}

interface RectPosition {
  [key: number]: { x: number };
}

export class RectLayer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private positions: Position[] = [];
  private rectPositionsMap: RectPosition = {};

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  drawRightHalves(apiData: ApiData[]): void {
    if (!apiData || apiData.length === 0) return;

    // 사각형 위치 업데이트
    this.updatePositions(apiData);

    // 오른쪽 반 사각형 그리기
    this.drawRightRectangles(apiData);
  }

  drawLeftHalves(apiData: ApiData[]): void {
    if (!apiData || apiData.length === 0) return;

    // 왼쪽 반 사각형 그리기
    this.drawLeftRectangles(apiData);
  }

  private updatePositions(apiData: ApiData[]): void {
    const count = this.calculateRectangleCount(apiData);
    const centerX = this.width / 2;

    this.initializePositions(count, centerX);
    this.updateRectPositionsMap(count);
  }

  private calculateRectangleCount(apiData: ApiData[]): number {
    const { MAX_RECTANGLES, BASE_DATA_PER_RECTANGLE } = RECT_LAYER_CONFIG;
    return apiData.length > MAX_RECTANGLES * BASE_DATA_PER_RECTANGLE
      ? MAX_RECTANGLES
      : Math.ceil(apiData.length / BASE_DATA_PER_RECTANGLE);
  }

  private initializePositions(count: number, centerX: number): void {
    const { startY } = RECT_CONFIG;
    const { VERTICAL_OFFSET } = RECT_LAYER_CONFIG;

    while (this.positions.length < count) {
      if (this.positions.length === 0) {
        this.positions.push({ x: centerX, y: startY + VERTICAL_OFFSET });
      } else {
        this.positions.push({
          x: this.positions[this.positions.length - 1].x,
          y: startY + VERTICAL_OFFSET
        });
      }
    }

    while (this.positions.length > count) {
      this.positions.pop();
    }
  }

  private updateRectPositionsMap(count: number): void {
    this.rectPositionsMap = {};
    for (let i = 0; i < count; i++) {
      this.rectPositionsMap[i] = { x: this.positions[i].x };
    }
  }

  private drawRightRectangles(apiData: ApiData[]): void {
    const count = this.calculateRectangleCount(apiData);
    const centerX = this.width / 2;
    const halfCount = Math.floor(count / 2);
    const { width, height, gap, startY } = RECT_CONFIG;

    const dataExecutionTime = getDataExecutionTimeCount(apiData);
    const rectColors = getCategoryColorByCount(dataExecutionTime, count);

    this.ctx.save();

    // 오른쪽 반 평행사변형 그리기
    for (let i = 0; i < count; i++) {
      const rectColor = rectColors[i];
      const targetX = centerX + (i - halfCount) * gap - width / 2;
      const targetY = startY + RECT_LAYER_CONFIG.VERTICAL_OFFSET;

      this.updatePosition(i, targetX, targetY);

      const position = this.positions[i];

      drawRightHalfParallelogram({
        ctx: this.ctx,
        x: position.x,
        y: position.y,
        width,
        height,
        topOffset: startY,
        color: rectColor
      });
    }

    this.ctx.restore();
  }

  private drawLeftRectangles(apiData: ApiData[]): void {
    const count = this.calculateRectangleCount(apiData);
    const { width, height, startY } = RECT_CONFIG;
    const dataExecutionTime = getDataExecutionTimeCount(apiData);
    const rectColors = getCategoryColorByCount(dataExecutionTime, count);

    this.ctx.save();

    for (let i = 0; i < count; i++) {
      const position = this.positions[i];
      const rectColor = rectColors[i];

      drawLeftHalfParallelogram({
        ctx: this.ctx,
        x: position.x,
        y: position.y,
        width,
        height,
        topOffset: startY,
        color: rectColor
      });
    }

    this.ctx.restore();
  }

  private updatePosition(index: number, targetX: number, targetY: number): void {
    this.positions[index].x = calculateAnimatedPosition(
      this.positions[index].x,
      targetX,
      RECT_LAYER_CONFIG.ANIMATION_SPEED
    );

    this.positions[index].y = calculateAnimatedPosition(
      this.positions[index].y,
      targetY,
      RECT_LAYER_CONFIG.ANIMATION_SPEED
    );

    this.rectPositionsMap[index] = { x: this.positions[index].x };
  }

  getRectPositions(): { x: number }[] {
    return Object.values(this.rectPositionsMap);
  }

  cleanup(): void {
    this.positions = [];
    this.rectPositionsMap = {};

    // 컨텍스트 참조 해제
    this.ctx = null as any;
  }
} 