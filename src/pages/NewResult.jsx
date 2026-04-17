import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

const ROMAN = ['I', 'II', 'III']

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-1 h-4 bg-amber-400 rounded-full" />
      <h2 className="text-xs font-black tracking-widest uppercase text-zinc-400">{children}</h2>
    </div>
  )
}

function ActivityCard({ activity, existingResult, players }) {
  const [open, setOpen] = useState(false)
  const [rankings, setRankings] = useState(existingResult?.rankings ?? [])
  const [dragIndex, setDragIndex] = useState(null)
  const [saved, setSaved] = useState(false)
  const touchRef = useRef(null)

  const unranked = players.filter(p => !rankings.includes(p.id))

  function toggle() {
    if (!open && existingResult) setRankings(existingResult.rankings)
    setOpen(o => !o)
  }

  function addToRanking(playerId) {
    setRankings(prev => [...prev, playerId])
  }

  function removeFromRanking(playerId) {
    setRankings(prev => prev.filter(id => id !== playerId))
  }

  // Desktop drag
  function handleDragStart(index) { setDragIndex(index) }
  function handleDragOver(e, index) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const next = [...rankings]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    setRankings(next)
    setDragIndex(index)
  }
  function handleDragEnd() { setDragIndex(null) }

  // Mobile touch drag
  function handleTouchStart(e, index) {
    touchRef.current = index
    setDragIndex(index)
  }
  function handleTouchMove(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const item = el?.closest('[data-rank-index]')
    if (!item) return
    const targetIndex = parseInt(item.dataset.rankIndex)
    if (isNaN(targetIndex) || targetIndex === touchRef.current) return
    const next = [...rankings]
    const [moved] = next.splice(touchRef.current, 1)
    next.splice(targetIndex, 0, moved)
    setRankings(next)
    touchRef.current = targetIndex
    setDragIndex(targetIndex)
  }
  function handleTouchEnd() {
    setDragIndex(null)
    touchRef.current = null
  }

  async function save() {
    if (rankings.length === 0) return
    if (existingResult) {
      await db.results.update(existingResult.id, { rankings, date: new Date() })
    } else {
      await db.results.add({ activityId: activity.id, date: new Date(), rankings })
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
  }

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${
      open ? 'border-amber-500/40 bg-zinc-900' : 'border-zinc-800 bg-zinc-900'
    }`}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{activity.emoji ?? '🎮'}</span>
          <span className="text-white font-bold uppercase tracking-wide text-sm">{activity.name}</span>
        </div>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
          <div className="space-y-2 pt-3">
            {rankings.map((playerId, index) => {
              const player = players.find(p => p.id === playerId)
              return (
                <div
                  key={playerId}
                  data-rank-index={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={e => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing transition-opacity ${
                    dragIndex === index ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span className="text-zinc-600 select-none text-sm">⠿</span>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    index === 0 ? 'bg-amber-400 text-zinc-950' :
                    index === 1 ? 'bg-zinc-600 text-zinc-200' :
                    index === 2 ? 'bg-amber-900/60 text-amber-600' :
                                 'bg-zinc-700 text-zinc-500'
                  }`}>
                    {index < 3 ? ROMAN[index] : index + 1}
                  </div>
                  <span className="flex-1 text-white font-bold uppercase tracking-wide text-sm">{player?.name}</span>
                  <button onClick={() => removeFromRanking(playerId)} className="text-zinc-600 hover:text-red-400 text-xl transition-colors">×</button>
                </div>
              )
            })}
          </div>

          {unranked.length > 0 && (
            <div>
              <p className="text-zinc-600 text-xs mb-2 uppercase tracking-wider">Appuie pour ajouter :</p>
              <div className="flex flex-wrap gap-2">
                {unranked.map(player => (
                  <button
                    key={player.id}
                    onClick={() => addToRanking(player.id)}
                    className="bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={rankings.length === 0 || saved}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-3 rounded-xl transition-colors uppercase tracking-wide text-sm"
          >
            {saved ? '✓ Enregistré !' : existingResult ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function NewResult() {
  const players = useLiveQuery(() => db.players.orderBy('name').toArray()) ?? []
  const activities = useLiveQuery(() => db.activities.orderBy('name').toArray()) ?? []
  const results = useLiveQuery(() => db.results.toArray()) ?? []

  if (players.length < 2) {
    return <p className="text-zinc-500 text-center py-12 uppercase tracking-wider text-xs">Ajoute au moins 2 joueurs pour enregistrer un résultat.</p>
  }
  if (activities.length === 0) {
    return <p className="text-zinc-500 text-center py-12 uppercase tracking-wider text-xs">Ajoute au moins une activité d'abord.</p>
  }

  const withResult = activities.filter(a => results.some(r => r.activityId === a.id))
  const withoutResult = activities.filter(a => !results.some(r => r.activityId === a.id))

  return (
    <div className="pt-2">
      {withoutResult.length > 0 && (
        <div>
          <SectionTitle>Sans classement</SectionTitle>
          <div className="space-y-2">
            {withoutResult.map(activity => (
              <ActivityCard key={activity.id} activity={activity} existingResult={null} players={players} />
            ))}
          </div>
        </div>
      )}

      {withResult.length > 0 && (
        <div className={withoutResult.length > 0 ? 'mt-6' : ''}>
          <SectionTitle>Avec classement</SectionTitle>
          <div className="space-y-2">
            {withResult.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                existingResult={results.find(r => r.activityId === activity.id)}
                players={players}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
