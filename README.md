# Canvas Transaction Visualization

실시간 API 트랜잭션을 시각화하는 Svelte 애플리케이션입니다. 이 애플리케이션은 Canvas API를 사용하여 API 트랜잭션의 흐름을 시각적으로 표현합니다.

![Transaction Visualization](https://github.com/user-attachments/assets/23b25342-0145-48d0-b6cb-9e066af68b23)

## 주요 기능

- API 트랜잭션의 실시간 시각화
- 실행 시간에 따른 트랜잭션 색상 분류 (빠름, 보통, 느림)
- 트랜잭션 단계별 시각화 (시작, 진행, 종료)


## 구조

```
src/
├── lib/
│   ├── canvas/
│   │   ├── CanvasRenderer.ts   # 메인 렌더러
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


## 기술 스택

- Svelte + SvelteKit
- TypeScript
- Canvas API
- MSW (Mock Service Worker)
