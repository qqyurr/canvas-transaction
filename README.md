# Canvas Transaction Visualization

실시간 API 트랜잭션을 시각화하는 Svelte 애플리케이션입니다. 이 애플리케이션은 Canvas API를 사용하여 API 트랜잭션의 흐름을 시각적으로 표현합니다.

![Transaction Visualization](https://github.com/user-attachments/assets/23b25342-0145-48d0-b6cb-9e066af68b23)

## 주요 기능

- API 트랜잭션의 실시간 시각화
- 실행 시간에 따른 트랜잭션 색상 분류 (빠름, 보통, 느림)
- 트랜잭션 단계별 시각화 (시작, 진행, 종료)
- 두 가지 렌더링 방식 지원:
  1. 더블 버퍼링 방식 (CanvasRenderer)
  2. 직접 렌더링 방식 (DirectRenderer)

## 렌더링 방식 비교

### 1. 더블 버퍼링 방식 (CanvasRenderer)

- **장점**:
  - 깜빡임 방지
  - 레이어 분리를 통한 성능 최적화
  - 복잡한 레이어 구성 지원

- **단점**:
  - 메모리 사용량 증가
  - 코드 복잡성 증가

### 2. 직접 렌더링 방식 (DirectRenderer)

- **장점**:
  - 메모리 사용량 감소
  - 코드 단순화
  - 더 직관적인 렌더링 흐름

- **단점**:
  - 깜빡임 발생 가능성
  - 복잡한 레이어 구성 시 성능 저하 가능성

## 구조

```
src/
├── lib/
│   ├── canvas/
│   │   ├── renderer.ts         # 더블 버퍼링 방식 렌더러
│   │   ├── DirectRenderer.ts   # 직접 렌더링 방식 렌더러
│   │   ├── RectLayer.ts        # 사각형 레이어 (더블 버퍼링용)
│   │   ├── CircleLayer.ts      # 원형 레이어 (더블 버퍼링용)
│   │   ├── shapes.ts           # 도형 그리기 유틸리티
│   │   └── config.ts           # 캔버스 설정
│   └── utils/
│       └── utils.ts            # 유틸리티 함수
├── routes/
│   └── canvas/
│       ├── +page.svelte        # 캔버스 페이지 컴포넌트
│       └── +page.ts            # 페이지 로드 로직
└── types/
    └── types.ts                # 타입 정의
```

## 사용 방법

1. 애플리케이션을 실행합니다.
```
npm install
npm run dev
```

2. 화면 하단의 체크박스를 통해 렌더링 방식을 선택할 수 있습니다.
   - 체크: 직접 렌더링 방식 (DirectRenderer)
   - 해제: 더블 버퍼링 방식 (CanvasRenderer)

3. 실시간으로 API 트랜잭션이 시각화되는 것을 확인합니다.

## 기술 스택

- Svelte + SvelteKit
- TypeScript
- Canvas API
- MSW (Mock Service Worker)
