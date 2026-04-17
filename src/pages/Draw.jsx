import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makeTeams(players, numTeams) {
  const shuffled = shuffle(players)
  const teams = Array.from({ length: numTeams }, () => [])
  shuffled.forEach((player, i) => teams[i % numTeams].push(player))
  return teams
}

const TEAM_COLORS = [
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', label: 'text-amber-400' },
  { border: 'border-sky-500/40', bg: 'bg-sky-500/10', label: 'text-sky-400' },
  { border: 'border-rose-500/40', bg: 'bg-rose-500/10', label: 'text-rose-400' },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', label: 'text-emerald-400' },
]

export default function Draw() {
  const players = useLiveQuery(() => db.players.orderBy('name').toArray()) ?? []
  const [deselected, setDeselected] = useState(new Set())
  const [numTeams, setNumTeams] = useState(2)
  const [teams, setTeams] = useState(null)

  const activePlayers = players.filter(p => !deselected.has(p.id))

  function togglePlayer(id) {
    setTeams(null)
    setDeselected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function draw() {
    if (activePlayers.length < numTeams) return
    setTeams(makeTeams(activePlayers, numTeams))
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <p className="uppercase tracking-wider text-xs">Ajoute des joueurs dans Options d'abord.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <label className="text-xs font-black tracking-widest uppercase text-zinc-500 mb-3 block">Joueurs disponibles</label>
        <div className="flex flex-wrap gap-2">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                deselected.has(player.id)
                  ? 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-black tracking-widest uppercase text-zinc-500 mb-3 block">Nombre d'équipes</label>
        <div className="flex gap-2">
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => { setNumTeams(n); setTeams(null) }}
              className={`w-12 h-12 rounded-xl font-black text-sm transition-colors ${
                numTeams === n ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={draw}
        disabled={activePlayers.length < numTeams}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-4 rounded-xl transition-colors uppercase tracking-wide text-base"
      >
        🎲 Tirer au sort
      </button>

      {teams && (
        <div className="space-y-3">
          {teams.map((team, i) => {
            const color = TEAM_COLORS[i % TEAM_COLORS.length]
            return (
              <div key={i} className={`rounded-xl border p-4 space-y-2 ${color.bg} ${color.border}`}>
                <p className={`font-black text-xs tracking-widest uppercase ${color.label}`}>Équipe {i + 1}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {team.map(player => (
                    <span key={player.id} className="text-white text-sm font-bold uppercase tracking-wide">{player.name}</span>
                  ))}
                </div>
              </div>
            )
          })}
          <button onClick={draw} className="w-full text-zinc-600 hover:text-zinc-300 text-xs py-2 transition-colors uppercase tracking-widest">
            ↺ Nouveau tirage
          </button>
        </div>
      )}
    </div>
  )
}
