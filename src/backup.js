import { db } from './db'
import { getPoints, savePoints } from './settings'

export async function exportData() {
  const [players, activities, results] = await Promise.all([
    db.players.toArray(),
    db.activities.toArray(),
    db.results.toArray(),
  ])
  const data = { players, activities, results, points: getPoints(), exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ranking-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  await db.transaction('rw', db.players, db.activities, db.results, async () => {
    await db.players.clear()
    await db.activities.clear()
    await db.results.clear()
    if (data.players?.length) await db.players.bulkAdd(data.players)
    if (data.activities?.length) await db.activities.bulkAdd(data.activities)
    if (data.results?.length) await db.results.bulkAdd(data.results)
  })
  if (data.points) savePoints(data.points)
}

export async function resetAll() {
  await db.transaction('rw', db.players, db.activities, db.results, async () => {
    await db.players.clear()
    await db.activities.clear()
    await db.results.clear()
  })
  localStorage.clear()
}
