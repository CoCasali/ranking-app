const POINTS_KEY = 'ranking_points'
export const DEFAULT_POINTS = [10, 7, 5, 3, 2, 1]

export function getPoints() {
  try {
    const stored = localStorage.getItem(POINTS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_POINTS
}

export function savePoints(points) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(points))
}
