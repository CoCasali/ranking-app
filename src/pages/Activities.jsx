import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export default function Activities() {
  const [name, setName] = useState('')
  const activities = useLiveQuery(() => db.activities.orderBy('name').toArray()) ?? []

  async function addActivity(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    await db.activities.add({ name: trimmed, createdAt: new Date() })
    setName('')
  }

  async function deleteActivity(id) {
    await db.activities.delete(id)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Activités</h2>

      <form onSubmit={addActivity} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom de l'activité"
          className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          +
        </button>
      </form>

      <div className="space-y-2">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-white font-medium">{activity.name}</span>
            <button
              onClick={() => deleteActivity(activity.id)}
              className="text-slate-500 hover:text-red-400 text-xl transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-slate-400 text-center py-8">Aucune activité ajoutée.</p>
        )}
      </div>
    </div>
  )
}
