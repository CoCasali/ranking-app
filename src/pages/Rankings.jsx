import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getPoints } from '../settings'

const ROMAN = ['I', 'II', 'III']

function computeStandings(players, results, points) {
  const totals = {}
  players.forEach(p => { totals[p.id] = { player: p, points: 0, wins: 0, breakdown: {} } })

  results.forEach(result => {
    result.rankings.forEach((playerId, index) => {
      if (totals[playerId]) {
        const pts = points[index] ?? 0
        totals[playerId].points += pts
        totals[playerId].breakdown[result.activityId] = { rank: index, pts }
        if (index === 0) totals[playerId].wins += 1
      }
    })
  })

  return Object.values(totals).sort((a, b) => b.points - a.points || b.wins - a.wins)
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-1 h-5 bg-amber-400 rounded-full" />
      <h2 className="text-xs font-black tracking-widest uppercase text-zinc-300">{children}</h2>
    </div>
  )
}

export default function Rankings() {
  const [view, setView] = useState('global')
  const players = useLiveQuery(() => db.players.toArray()) ?? []
  const results = useLiveQuery(() => db.results.toArray()) ?? []
  const activities = useLiveQuery(() => db.activities.toArray()) ?? []
  const points = getPoints()

  const standings = computeStandings(players, results, points)

  async function deleteResult(id) {
    await db.results.delete(id)
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <p>Ajoute des joueurs dans Options d'abord.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex bg-zinc-900 rounded-xl p-1 gap-1 mt-4 mb-2">
        <button
          onClick={() => setView('global')}
          className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-colors ${
            view === 'global' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Général
        </button>
        <button
          onClick={() => setView('activities')}
          className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-colors ${
            view === 'activities' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Par activité
        </button>
      </div>

      {view === 'global' && (
        <div>
          <SectionTitle>Classement général</SectionTitle>
          <div className="space-y-2">
            {standings.map((entry, index) => (
              <div
                key={entry.player.id}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  index === 0 ? 'bg-amber-500/10 border border-amber-500/30' :
                  index === 1 ? 'bg-zinc-800/60 border border-zinc-700' :
                  index === 2 ? 'bg-zinc-800/40 border border-zinc-800' :
                               'bg-zinc-900/60 border border-zinc-800/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm ${
                  index === 0 ? 'bg-amber-400 text-zinc-950' :
                  index === 1 ? 'bg-zinc-600 text-zinc-200' :
                  index === 2 ? 'bg-amber-900/60 text-amber-600' :
                               'bg-zinc-800 text-zinc-500'
                }`}>
                  {index < 3 ? ROMAN[index] : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-black tracking-wide uppercase text-sm ${
                    index === 0 ? 'text-white' : 'text-zinc-300'
                  }`}>{entry.player.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {results.map(result => {
                      const rank = result.rankings.indexOf(entry.player.id)
                      if (rank === -1) return null
                      const activity = activities.find(a => a.id === result.activityId)
                      const pts = points[rank] ?? 0
                      return (
                        <span key={result.id} className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-bold ${
                          rank === 0 ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-500/40' :
                          rank === 1 ? 'bg-zinc-700 text-zinc-300 ring-1 ring-zinc-600' :
                          rank === 2 ? 'bg-amber-900/30 text-amber-700 ring-1 ring-amber-800/50' :
                                       'bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700/50'
                        }`}>
                          <span>{activity?.emoji ?? '🎮'}</span>
                          <span>+{pts}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-2xl font-black ${index === 0 ? 'text-amber-400' : 'text-white'}`}>
                    {entry.points}
                  </p>
                  <p className="text-zinc-600 text-xs tracking-widest uppercase">pts</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-700 text-center pt-4 tracking-wider">
            Barème · {points.join(' / ')} pts
          </p>
        </div>
      )}

      {view === 'activities' && (
        <div>
          <SectionTitle>Par activité</SectionTitle>
          <div className="space-y-3">
            {activities.map(activity => {
              const result = results.find(r => r.activityId === activity.id)
              if (!result) return null
              return (
                <div key={activity.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white tracking-wide uppercase text-sm flex items-center gap-2">
                      {activity.emoji && <span>{activity.emoji}</span>}
                      {activity.name}
                    </h3>
                    <button
                      onClick={() => deleteResult(result.id)}
                      className="text-zinc-600 hover:text-red-400 text-xs tracking-wider transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="space-y-2">
                    {result.rankings.map((playerId, index) => {
                      const player = players.find(p => p.id === playerId)
                      return (
                        <div key={playerId} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            index === 0 ? 'bg-amber-400 text-zinc-950' :
                            index === 1 ? 'bg-zinc-600 text-zinc-200' :
                            index === 2 ? 'bg-amber-900/60 text-amber-600' :
                                         'bg-zinc-800 text-zinc-500'
                          }`}>
                            {index < 3 ? ROMAN[index] : index + 1}
                          </div>
                          <span className="text-zinc-300 text-sm font-bold uppercase tracking-wide flex-1">{player?.name ?? '?'}</span>
                          <span className={`text-sm font-black ${index === 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                            +{points[index] ?? 0}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {results.length === 0 && (
              <p className="text-zinc-600 text-center py-8 tracking-wider uppercase text-xs">Aucun résultat enregistré.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
