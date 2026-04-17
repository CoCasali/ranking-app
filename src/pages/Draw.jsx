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
  { border: 'border-indigo-700', bg: 'bg-indigo-900/30', label: 'text-indigo-400' },
  { border: 'border-emerald-700', bg: 'bg-emerald-900/30', label: 'text-emerald-400' },
  { border: 'border-amber-700', bg: 'bg-amber-900/30', label: 'text-amber-400' },
  { border: 'border-rose-700', bg: 'bg-rose-900/30', label: 'text-rose-400' },
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
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p>Ajoute des joueurs dans Options d'abord.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-slate-400 text-sm mb-3">Joueurs disponibles</p>
        <div className="flex flex-wrap gap-2">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                deselected.has(player.id)
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-3">Nombre d'équipes</p>
        <div className="flex gap-2">
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => { setNumTeams(n); setTeams(null) }}
              className={`w-12 h-12 rounded-xl font-bold transition-colors ${
                numTeams === n ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-colors"
      >
        🎲 Tirer au sort
      </button>

      {teams && (
        <div className="space-y-3">
          {teams.map((team, i) => {
            const color = TEAM_COLORS[i % TEAM_COLORS.length]
            return (
              <div key={i} className={`rounded-xl border p-4 space-y-2 ${color.bg} ${color.border}`}>
                <p className={`font-bold text-sm ${color.label}`}>Équipe {i + 1}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {team.map(player => (
                    <span key={player.id} className="text-white text-sm font-medium">{player.name}</span>
                  ))}
                </div>
              </div>
            )
          })}
          <button onClick={draw} className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors">
            ↺ Nouveau tirage
          </button>
        </div>
      )}
    </div>
  )
}
