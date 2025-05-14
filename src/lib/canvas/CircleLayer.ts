import type { ApiData } from '../../types/types';
import { CIRCLE_CONFIG, TRAIL_CONFIG } from './config';
import {
  createCachedCircleImage,
  createCachedTrailImage,
  drawCircleWithTrail,
  calculateOffScreenStatus,
  getColorForApiData
} from '$lib/utils/utils';
import { Color } from '$lib/utils/utils';

// 원형 레이어 관련 설정
const CIRCLE_LAYER_CONFIG = {
  OFFSET: {
    START: -0.01,
    END: 100,
    MARGIN: 50,
    PADDING: 10
  }
} as const;

export class CircleLayer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private readonly circleCache: Map<string, HTMLCanvasElement> = new Map();
  private readonly trailCache: Map<string, HTMLCanvasElement> = new Map();
  private activeIds: Set<string> = new Set();

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initializeCache();
  }

  private initializeCache(): void {
    // 필요한 색상에 대한 기본 캐시 생성
    this.getCircleImage(Color.Fast);
    this.getCircleImage(Color.Normal);
    this.getCircleImage(Color.Slow);

    this.getTrailImage(Color.Fast);
    this.getTrailImage(Color.Normal);
    this.getTrailImage(Color.Slow);
  }

  private getCircleImage(color: string): HTMLCanvasElement {
    const key = `circle_${color}`;
    if (!this.circleCache.has(key)) {
      this.circleCache.set(key, createCachedCircleImage(CIRCLE_CONFIG.radius, color));
    }
    return this.circleCache.get(key)!;
  }

  private getTrailImage(color: string): HTMLCanvasElement {
    const key = `trail_${color}`;
    if (!this.trailCache.has(key)) {
      this.trailCache.set(key, createCachedTrailImage(
        CIRCLE_CONFIG.radius,
        color,
        TRAIL_CONFIG.segments,
        TRAIL_CONFIG.alphaFactor
      ));
    }
    return this.trailCache.get(key)!;
  }

  draw(apiData: ApiData[], rectPositions: { x: number }[]): void {
    const activeData = apiData.filter(data => data.isActive);
    this.drawActiveCircles(activeData, rectPositions);
  }

  private drawActiveCircles(activeData: ApiData[], rectPositions: { x: number }[]): void {
    const currentActiveIds = new Set<string>();
    const { radius } = CIRCLE_CONFIG;
    const trailLength = radius * TRAIL_CONFIG.segments;

    this.ctx.save();

    for (const data of activeData) {
      const { x, y, isOffScreen } = this.calculateCirclePosition(data, rectPositions);
      if (isOffScreen) continue;

      const color = getColorForApiData(data);

      // 캐시된 이미지 사용
      const circleImage = this.getCircleImage(color);
      const trailImage = this.getTrailImage(color);

      // 캐시된 이미지를 사용하여 원과 궤적 그리기
      drawCircleWithTrail(
        this.ctx,
        x,
        y,
        circleImage,
        trailImage,
        radius,
        trailLength
      );

      currentActiveIds.add(data.id);
    }

    this.ctx.restore();
    this.activeIds = currentActiveIds;
  }

  private calculateCirclePosition(data: ApiData, rectPositions: { x: number }[]): { x: number; y: number; isOffScreen: boolean } {
    const canvasWidth = this.width;

    const startPhaseEndX = rectPositions[1]?.x || rectPositions[0]?.x;
    const endPhaseStartX = rectPositions[rectPositions.length - 2]?.x || rectPositions[rectPositions.length - 1]?.x;

    const { x, isOffScreen } = calculateOffScreenStatus(
      data,
      canvasWidth,
      startPhaseEndX,
      endPhaseStartX,
      CIRCLE_LAYER_CONFIG.OFFSET
    );

    const idNum = parseInt(data.id);
    const group = idNum % CIRCLE_CONFIG.groupCount;
    const y = CIRCLE_CONFIG.groupPositions.y[group] || CIRCLE_CONFIG.startY;

    return { x, y, isOffScreen };
  }

  cleanup(): void {
    this.cleanupCache();
    this.activeIds.clear();

    // 컨텍스트 참조 해제
    this.ctx = null as any;
  }

  private cleanupCache(): void {
    // 캐시된 이미지 정리
    this.circleCache.forEach(canvas => {
      canvas.width = 0;
      canvas.height = 0;
    });
    this.circleCache.clear();

    this.trailCache.forEach(canvas => {
      canvas.width = 0;
      canvas.height = 0;
    });
    this.trailCache.clear();
  }
} 