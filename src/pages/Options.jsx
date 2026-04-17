import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getPoints, savePoints } from '../settings'
import { exportData, importData, resetAll } from '../backup'

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

function PlayersSection() {
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
    <Section title="Joueurs">
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
            <button onClick={() => deletePlayer(player.id)} className="text-slate-500 hover:text-red-400 text-xl transition-colors">×</button>
          </div>
        ))}
        {players.length === 0 && <p className="text-slate-400 text-center py-4">Aucun joueur ajouté.</p>}
      </div>
    </Section>
  )
}

function ActivitiesSection() {
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
    <Section title="Activités">
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
            <button onClick={() => deleteActivity(activity.id)} className="text-slate-500 hover:text-red-400 text-xl transition-colors">×</button>
          </div>
        ))}
        {activities.length === 0 && <p className="text-slate-400 text-center py-4">Aucune activité ajoutée.</p>}
      </div>
    </Section>
  )
}

function PointsSection() {
  const [points, setPoints] = useState(() => getPoints())
  const [saved, setSaved] = useState(false)

  function updatePoint(index, value) {
    const next = [...points]
    next[index] = Number(value) || 0
    setPoints(next)
    setSaved(false)
  }

  function addPosition() {
    setPoints(prev => [...prev, 0])
    setSaved(false)
  }

  function removePosition() {
    if (points.length <= 2) return
    setPoints(prev => prev.slice(0, -1))
    setSaved(false)
  }

  function handleSave() {
    savePoints(points)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <Section title="Barème de points">
      <div className="bg-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-slate-400 text-xs">Points attribués du 1er au dernier</p>
        <div className="flex flex-wrap gap-2">
          {points.map((pts, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-slate-500 text-xs">{index + 1}e</span>
              <input
                type="number"
                min="0"
                value={pts}
                onChange={e => updatePoint(index, e.target.value)}
                className="w-14 bg-slate-700 text-white text-center rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={removePosition} disabled={points.length <= 2} className="text-slate-500 hover:text-white disabled:opacity-30 text-sm transition-colors">− Position</button>
          <button onClick={addPosition} className="text-slate-500 hover:text-white text-sm transition-colors">+ Position</button>
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
        >
          {saved ? '✓ Enregistré !' : 'Enregistrer le barème'}
        </button>
      </div>
    </Section>
  )
}

function DataSection() {
  const fileRef = useRef(null)
  const [confirm, setConfirm] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleExport() {
    await exportData()
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importData(file)
      setStatus('import_ok')
    } catch {
      setStatus('import_err')
    }
    e.target.value = ''
    setTimeout(() => setStatus(null), 2500)
  }

  async function handleReset() {
    await resetAll()
    setConfirm(false)
    setStatus('reset_ok')
    setTimeout(() => setStatus(null), 2000)
  }

  return (
    <Section title="Données">
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
        >
          Exporter la sauvegarde (.json)
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
        >
          Importer une sauvegarde
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        {status === 'import_ok' && <p className="text-emerald-400 text-xs text-center">Données importées avec succès.</p>}
        {status === 'import_err' && <p className="text-red-400 text-xs text-center">Fichier invalide.</p>}
        {status === 'reset_ok' && <p className="text-slate-400 text-xs text-center">Toutes les données ont été effacées.</p>}

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="w-full bg-slate-800 hover:bg-red-900/40 text-red-400 text-sm font-medium py-3 rounded-xl transition-colors mt-2"
          >
            Réinitialiser tout
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 space-y-3">
            <p className="text-red-300 text-sm text-center">Supprimer joueurs, activités et résultats ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)} className="flex-1 bg-slate-700 text-white text-sm py-2 rounded-lg">Annuler</button>
              <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded-lg font-semibold">Confirmer</button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

export default function Options() {
  return (
    <div className="space-y-8">
      <PlayersSection />
      <ActivitiesSection />
      <PointsSection />
      <DataSection />
    </div>
  )
}
