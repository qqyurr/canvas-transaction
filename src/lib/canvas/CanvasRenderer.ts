import type { ApiData } from '../../types/types';
import type { PhaseData } from '$lib/utils/utils';
import {
  Color,
  getDataExecutionTimeCount,
  createPhaseData,
  updateDataItem,
  sortDataByEndTime,
  cleanupData,
  cleanupCanvasContext
} from '$lib/utils/utils';
import { RectLayer } from './RectLayer';
import { CircleLayer } from './CircleLayer';

interface RendererConfig {
  readonly UPDATE_INTERVAL: number;
  readonly DATA_CLEANUP_INTERVAL: number;
}

const DEFAULT_CONFIG: RendererConfig = {
  UPDATE_INTERVAL: 1000 / 10, // 10fps
  DATA_CLEANUP_INTERVAL: 2000 // 2 seconds
};

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly config: RendererConfig;

  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private apiData: (ApiData & PhaseData)[] = [];
  private lastFrameTime: number = 0;
  private lastUpdateTime: number = 0;
  private lastCleanupTime: number = 0;

  // 레이어 객체
  private rectLayer!: RectLayer;
  private circleLayer!: CircleLayer;

  constructor(canvas: HTMLCanvasElement, config: Partial<RendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;

    this.initializeTimestamps();
    this.initializeLayers();
  }

  private initializeTimestamps(): void {
    const now = Date.now();
    this.lastFrameTime = now;
    this.lastUpdateTime = now;
    this.lastCleanupTime = now;
  }

  private initializeLayers(): void {
    this.rectLayer = new RectLayer(this.ctx, this.canvas.width, this.canvas.height);
    this.circleLayer = new CircleLayer(this.ctx, this.canvas.width, this.canvas.height);
  }

  updateFetchedData(newData: ApiData[]): void {
    const now = Date.now();
    const processedData = newData.map(item => createPhaseData(item, now));
    this.apiData.push(...processedData);
  }

  private updateAndFilterData(): (ApiData & PhaseData)[] {
    const now = Date.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    if (now - this.lastCleanupTime > this.config.DATA_CLEANUP_INTERVAL) {
      this.apiData = cleanupData(this.apiData);
      this.lastCleanupTime = now;
    }

    // 활성 데이터만 업데이트
    this.apiData.forEach(data => updateDataItem(data, deltaTime, now));

    // 데이터 정렬, 최신 데이터가 마지막에 오도록
    return sortDataByEndTime(this.apiData);
  }

  // 렌더링 루프
  private render(): void {
    if (!this.isRunning) return;

    const now = Date.now();
    if (now - this.lastUpdateTime >= this.config.UPDATE_INTERVAL) {
      this.apiData = this.updateAndFilterData();
      this.lastUpdateTime = now;
    }

    // 캔버스 초기화
    this.clearCanvas();

    // 배경 그리기
    this.drawBackground();

    // 렌더링 순서 (z-index)
    // 1. 오른쪽 반 사각형
    this.rectLayer.drawRightHalves(this.apiData);

    // 2. 원형 (및 트레일)
    this.circleLayer.draw(this.apiData, this.rectLayer.getRectPositions());

    // 3. 왼쪽 반 사각형 (원 위에 그려져야 함)
    this.rectLayer.drawLeftHalves(this.apiData);

    // API 정보 렌더링
    this.renderApiInfo();

    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderApiInfo(): void {
    if (this.apiData.length === 0) return;

    this.ctx.save();
    this.ctx.font = 'bold 15px Arial';

    const legendX = this.canvas.width / 2;
    const spacing = 20;
    const marginY = 40;

    const executionTimeCount = getDataExecutionTimeCount(this.apiData);
    const startPhaseCount = this.apiData.filter(data => data.phase === 'start').length;
    const endPhaseCount = this.apiData.filter(data => data.phase === 'end').length;

    this.renderExecutionTimeCounts(executionTimeCount, legendX, spacing, marginY);
    this.renderPhaseCounts(startPhaseCount, endPhaseCount, marginY);

    this.ctx.restore();
  }

  private renderExecutionTimeCounts(
    counts: { fast: number; normal: number; slow: number },
    legendX: number,
    spacing: number,
    marginY: number
  ): void {
    this.ctx.fillStyle = Color.Fast;
    this.ctx.fillText(counts.fast.toString(), legendX - spacing * 2, marginY);

    this.ctx.fillStyle = Color.Normal;
    this.ctx.fillText(counts.normal.toString(), legendX, marginY);

    this.ctx.fillStyle = Color.Slow;
    this.ctx.fillText(counts.slow.toString(), legendX + spacing * 2, marginY);
  }

  private renderPhaseCounts(startCount: number, endCount: number, marginY: number): void {
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(`${startCount}`, 50, marginY);
    this.ctx.fillText(`${endCount}`, this.canvas.width - 70, marginY);
  }

  cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.rectLayer) {
      this.rectLayer.cleanup();
      (this as any).rectLayer = null;
    }

    if (this.circleLayer) {
      this.circleLayer.cleanup();
      (this as any).circleLayer = null;
    }

    this.resetState();
  }

  private resetState(): void {
    this.apiData = [];
    this.lastFrameTime = 0;
    this.lastUpdateTime = 0;
    this.lastCleanupTime = 0;

    cleanupCanvasContext({ canvas: this.canvas, ctx: this.ctx });
    // 컨텍스트 참조 해제
    this.ctx = null as any;
    this.canvas = null as any;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  stop(): void {
    this.isRunning = false;
    this.cleanup();
  }
} 