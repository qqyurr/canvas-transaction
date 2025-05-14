export const CIRCLE_CONFIG = {
  rows: 3,
  cols: 5,
  radius: 30,
  gap: 30,
  startX: 40,
  startY: 300,
  groupCount: 3,
  groupPositions: {
    y: [295, 360, 425]
  }
};

export const RECT_CONFIG = {
  width: 100,
  height: 320,
  gap: 50,
  startY: 140
};

export const TRAIL_CONFIG = {
  segments: 30,
  alphaFactor: 0.01
};

export const CANVAS_CONFIG = {
  width: 1200,
  height: 800,
  backgroundColor: 'white',
  animationSpeed: 0.05,
} as const;
