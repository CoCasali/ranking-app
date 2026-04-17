import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export default function Players() {
  const [name, setName] = useState('')
  const players = useLiveQuery(() => db.players.orderBy('name').toArray()) ?? []

  async function addPlayer(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    await db.players.add({ name: trimmed, createdAt: new Date() })
    setName('')
  }

  async function deletePlayer(id) {
    await db.players.delete(id)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Joueurs</h2>

      <form onSubmit={addPlayer} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom du joueur"
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
        {players.map(player => (
          <div key={player.id} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-white font-medium">{player.name}</span>
            <button
              onClick={() => deletePlayer(player.id)}
              className="text-slate-500 hover:text-red-400 text-xl transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-slate-400 text-center py-8">Aucun joueur ajouté.</p>
        )}
      </div>
    </div>
  )
}
