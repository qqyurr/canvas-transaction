import { HttpResponse, http } from 'msw'

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const handlers = [
  http.get('http://localhost:5173/api/data', () => {
    const data = Array.from({ length: getRandomNumber(1, 100) }, (_, index) => ({
      id: Date.now() + index, // 고유 id
      executionTime: getRandomNumber(1, 100), // 1~100초 랜덤
      startOffset: Math.random() // 0~1 사이의 랜덤 시작 시간 오프셋
    }));
    return HttpResponse.json({ data })
  })
]