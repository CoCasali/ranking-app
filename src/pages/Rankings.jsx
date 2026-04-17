import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getPoints } from '../settings'

function computeStandings(players, results, points) {
  const totals = {}
  players.forEach(p => { totals[p.id] = { player: p, points: 0, wins: 0 } })

  results.forEach(result => {
    result.rankings.forEach((playerId, index) => {
      if (totals[playerId]) {
        const pts = points[index] ?? 0
        totals[playerId].points += pts
        if (index === 0) totals[playerId].wins += 1
      }
    })
  })

  return Object.values(totals).sort((a, b) => b.points - a.points)
}

export default function Rankings() {
  const [view, setView] = useState('global')
  const players = useLiveQuery(() => db.players.toArray()) ?? []
  const results = useLiveQuery(() => db.results.toArray()) ?? []
  const activities = useLiveQuery(() => db.activities.toArray()) ?? []
  const points = getPoints()

  function getPlayerBadges(playerId) {
    return results.map(result => {
      const rank = result.rankings.indexOf(playerId)
      if (rank === -1) return null
      const activity = activities.find(a => a.id === result.activityId)
      return { emoji: activity?.emoji ?? '🎮', rank }
    }).filter(Boolean)
  }

  const standings = computeStandings(players, results, points)

  async function deleteResult(id) {
    await db.results.delete(id)
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-lg">Aucun joueur pour l'instant.</p>
        <p className="text-sm mt-1">Ajoute des joueurs dans l'onglet Joueurs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => setView('global')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'global' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Général
        </button>
        <button
          onClick={() => setView('activities')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'activities' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Par activité
        </button>
      </div>

      {view === 'global' && (
        <div className="space-y-3">
          {standings.map((entry, index) => (
            <div key={entry.player.id} className="flex items-center gap-4 bg-slate-800 rounded-xl p-4">
              <span className={`text-2xl font-black w-8 text-center ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-slate-300' :
                index === 2 ? 'text-amber-600' : 'text-slate-500'
              }`}>{index + 1}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">{entry.player.name}</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {getPlayerBadges(entry.player.id).map(({ emoji, rank }, i) => (
                    <span key={i} className={`text-sm w-7 h-7 flex items-center justify-center rounded-lg ${
                      rank === 0 ? 'bg-yellow-400/30 ring-1 ring-yellow-400' :
                      rank === 1 ? 'bg-slate-400/20 ring-1 ring-slate-400' :
                      rank === 2 ? 'bg-amber-700/20 ring-1 ring-amber-700' :
                                   'bg-slate-700/40 ring-1 ring-slate-600'
                    }`}>{emoji}</span>
                  ))}
                </div>
              </div>
              <span className="text-xl font-bold text-indigo-400">{entry.points} pts</span>
            </div>
          ))}
          <p className="text-xs text-slate-500 text-center pt-2">
            Barème : {points.join(' / ')} pts
          </p>
        </div>
      )}

      {view === 'activities' && (
        <div className="space-y-4">
          {activities.map(activity => {
            const result = results.find(r => r.activityId === activity.id)
            if (!result) return null
            return (
              <div key={activity.id} className="bg-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {activity.emoji && <span>{activity.emoji}</span>}
                    {activity.name}
                  </h3>
                  <button
                    onClick={() => deleteResult(result.id)}
                    className="text-slate-500 hover:text-red-400 text-sm transition-colors px-2 py-1"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="space-y-2">
                  {result.rankings.map((playerId, index) => {
                    const player = players.find(p => p.id === playerId)
                    return (
                      <div key={playerId} className="flex items-center gap-3">
                        <span className={`font-black w-6 text-center text-sm ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-slate-300' :
                          index === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>{index + 1}</span>
                        <span className="text-white text-sm flex-1">{player?.name ?? '?'}</span>
                        <span className="text-indigo-400 text-sm font-medium">
                          {points[index] ?? 0} pts
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {results.length === 0 && (
            <p className="text-slate-400 text-center py-8">Aucun résultat enregistré.</p>
          )}
        </div>
      )}
    </div>
  )
}
