import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export default function NewResult({ onSaved }) {
  const [activityId, setActivityId] = useState('')
  const [rankings, setRankings] = useState([])
  const [saved, setSaved] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)

  const players = useLiveQuery(() => db.players.orderBy('name').toArray()) ?? []
  const activities = useLiveQuery(() => db.activities.orderBy('name').toArray()) ?? []
  const existingResults = useLiveQuery(() => db.results.toArray()) ?? []

  const usedActivityIds = new Set(existingResults.map(r => r.activityId))
  const availableActivities = activities.filter(a => !usedActivityIds.has(a.id))

  const unranked = players.filter(p => !rankings.includes(p.id))

  function addToRanking(playerId) {
    setRankings(prev => [...prev, playerId])
  }

  function removeFromRanking(playerId) {
    setRankings(prev => prev.filter(id => id !== playerId))
  }

  function handleDragStart(index) {
    setDragIndex(index)
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newRankings = [...rankings]
    const [moved] = newRankings.splice(dragIndex, 1)
    newRankings.splice(index, 0, moved)
    setRankings(newRankings)
    setDragIndex(index)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  async function saveResult() {
    if (!activityId || rankings.length === 0) return
    await db.results.add({
      activityId: Number(activityId),
      date: new Date(),
      rankings,
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setActivityId('')
      setRankings([])
      if (onSaved) onSaved()
    }, 1200)
  }

  if (players.length < 2) {
    return (
      <div className="text-slate-400 text-center py-12">
        <p>Ajoute au moins 2 joueurs pour enregistrer un résultat.</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-slate-400 text-center py-12">
        <p>Ajoute au moins une activité d'abord.</p>
      </div>
    )
  }

  if (availableActivities.length === 0) {
    return (
      <div className="text-slate-400 text-center py-12">
        <p>Toutes les activités ont déjà un classement.</p>
        <p className="text-sm mt-1">Supprime un classement depuis l'onglet Classement.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Nouveau résultat</h2>

      <div>
        <label className="text-slate-400 text-sm mb-2 block">Activité</label>
        <select
          value={activityId}
          onChange={e => setActivityId(e.target.value)}
          className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Choisir une activité...</option>
          {availableActivities.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-slate-400 text-sm mb-2 block">
          Classement (du 1er au dernier)
        </label>
        <div className="space-y-2 mb-4">
          {rankings.map((playerId, index) => {
            const player = players.find(p => p.id === playerId)
            return (
              <div
                key={playerId}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing transition-opacity ${
                  dragIndex === index ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="text-slate-500 text-base select-none">⠿</span>
                <span className={`font-black w-6 text-center ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-slate-300' :
                  index === 2 ? 'text-amber-600' : 'text-slate-500'
                }`}>{index + 1}</span>
                <span className="flex-1 text-white font-medium">{player?.name}</span>
                <button
                  onClick={() => removeFromRanking(playerId)}
                  className="text-slate-500 hover:text-red-400 text-xl transition-colors"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>

        {unranked.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs mb-2">Appuie sur un joueur pour l'ajouter :</p>
            <div className="flex flex-wrap gap-2">
              {unranked.map(player => (
                <button
                  key={player.id}
                  onClick={() => addToRanking(player.id)}
                  className="bg-slate-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={saveResult}
        disabled={!activityId || rankings.length === 0 || saved}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-colors"
      >
        {saved ? '✓ Enregistré !' : 'Enregistrer'}
      </button>
    </div>
  )
}
