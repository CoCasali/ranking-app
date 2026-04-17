import Dexie from 'dexie'

export const db = new Dexie('RankingApp')

db.version(1).stores({
  players: '++id, name, createdAt',
  activities: '++id, name, createdAt',
  results: '++id, activityId, date',
})
