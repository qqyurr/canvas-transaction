export interface ApiData {
  id: string;
  executionTime: number;
  startTime?: number;     // 데이터 수신 시간
  elapsedTime?: number;   // 경과 시간
  position?: number;      // 현재 위치 (0~1 사이 비율)
  isActive?: boolean;     // 활성 상태 여부
  phase?: 'start' | 'progress' | 'end'; // 요청의 단계 (시작, 진행중, 종료)
  startOffset: number;   // 시작 오프셋
  endTime?: number;      // 종료 시점
}