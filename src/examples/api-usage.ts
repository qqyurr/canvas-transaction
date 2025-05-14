export async function fetchData() {
  const response = await fetch('http://localhost:5173/api/data')
  const result = await response.json()
  return result.data
}