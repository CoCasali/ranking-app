import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getPoints, savePoints } from '../settings'
import { exportData, importData, resetAll } from '../backup'

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pt-2">
        <div className="w-1 h-4 bg-amber-400 rounded-full" />
        <h2 className="text-xs font-black tracking-widest uppercase text-zinc-400">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function PlayersSection() {
  const [name, setName] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
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
    setOpenMenuId(null)
  }

  function startEdit(player) {
    setEditingId(player.id)
    setEditName(player.name)
    setOpenMenuId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    const trimmed = editName.trim()
    if (!trimmed) return
    await db.players.update(id, { name: trimmed })
    setEditingId(null)
  }

  return (
    <Section title="Joueurs">
      <form onSubmit={addPlayer} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom du joueur"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-3 rounded-xl transition-colors">
          +
        </button>
      </form>
      <div className="space-y-2">
        {players.map(player => (
          <div key={player.id}>
            {editingId === player.id ? (
              <div className="bg-zinc-900 border border-amber-500/40 rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex gap-2">
                  <button onClick={cancelEdit} className="flex-1 bg-zinc-800 text-zinc-400 text-xs font-bold py-2 rounded-lg uppercase tracking-wider">Annuler</button>
                  <button onClick={() => saveEdit(player.id)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black py-2 rounded-lg uppercase tracking-wider">Enregistrer</button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-white font-bold uppercase tracking-wide text-sm">{player.name}</span>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === player.id ? null : player.id)}
                    className={`text-lg transition-colors ${openMenuId === player.id ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-300'}`}
                  >
                    ⚙️
                  </button>
                </div>
                {openMenuId === player.id && (
                  <div className="flex border-t border-zinc-800">
                    <button
                      onClick={() => startEdit(player)}
                      className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-amber-400 hover:bg-zinc-800 transition-colors"
                    >
                      Éditer
                    </button>
                    <div className="w-px bg-zinc-800" />
                    <button
                      onClick={() => deletePlayer(player.id)}
                      className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-zinc-800 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {players.length === 0 && <p className="text-zinc-600 text-center py-4 text-xs uppercase tracking-wider">Aucun joueur ajouté.</p>}
      </div>
    </Section>
  )
}

const ACTIVITY_EMOJIS = ['🎯','🎲','🃏','♟️','🎮','🏓','🎳','🎰','🧩','🏆','⚽','🏀','🎾','🏐','🥊','🎱','🪀','🎪','🎨','🎭','🎬','🍺','🚴','🤺','🎻','🎸','🏊','🥋']

function ActivitiesSection() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('🎯')
  const [openMenuId, setOpenMenuId] = useState(null)
  const activities = useLiveQuery(() => db.activities.orderBy('name').toArray()) ?? []

  async function addActivity(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    await db.activities.add({ name: trimmed, emoji, createdAt: new Date() })
    setName('')
    setEmoji('🎯')
  }

  async function deleteActivity(id) {
    await db.activities.delete(id)
  }

  function startEdit(activity) {
    setEditingId(activity.id)
    setEditName(activity.name)
    setEditEmoji(activity.emoji ?? '🎯')
    setOpenMenuId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    const trimmed = editName.trim()
    if (!trimmed) return
    await db.activities.update(id, { name: trimmed, emoji: editEmoji })
    setEditingId(null)
  }

  return (
    <Section title="Activités">
      <form onSubmit={addActivity} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom de l'activité"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-3 rounded-xl transition-colors">
            +
          </button>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <p className="text-zinc-600 text-xs mb-2 uppercase tracking-wider">Icône</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  emoji === e ? 'bg-amber-500' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </form>
      <div className="space-y-2">
        {activities.map(activity => (
          <div key={activity.id}>
            {editingId === activity.id ? (
              <div className="bg-zinc-900 border border-amber-500/40 rounded-xl p-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVITY_EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEditEmoji(e)}
                      className={`text-lg w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                        editEmoji === e ? 'bg-amber-500' : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={cancelEdit} className="flex-1 bg-zinc-800 text-zinc-400 text-xs font-bold py-2 rounded-lg uppercase tracking-wider">Annuler</button>
                  <button onClick={() => saveEdit(activity.id)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black py-2 rounded-lg uppercase tracking-wider">Enregistrer</button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activity.emoji ?? '🎮'}</span>
                    <span className="text-white font-bold uppercase tracking-wide text-sm">{activity.name}</span>
                  </div>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === activity.id ? null : activity.id)}
                    className={`text-lg transition-colors ${openMenuId === activity.id ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-300'}`}
                  >
                    ⚙️
                  </button>
                </div>
                {openMenuId === activity.id && (
                  <div className="flex border-t border-zinc-800">
                    <button
                      onClick={() => startEdit(activity)}
                      className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-amber-400 hover:bg-zinc-800 transition-colors"
                    >
                      Éditer
                    </button>
                    <div className="w-px bg-zinc-800" />
                    <button
                      onClick={() => { deleteActivity(activity.id); setOpenMenuId(null) }}
                      className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-zinc-800 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {activities.length === 0 && <p className="text-zinc-600 text-center py-4 text-xs uppercase tracking-wider">Aucune activité ajoutée.</p>}
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <p className="text-zinc-500 text-xs uppercase tracking-wider">Points du 1er au dernier</p>
        <div className="flex flex-wrap gap-2">
          {points.map((pts, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-zinc-600 text-xs">{index + 1}e</span>
              <input
                type="number"
                min="0"
                value={pts}
                onChange={e => updatePoint(index, e.target.value)}
                className="w-14 bg-zinc-800 border border-zinc-700 text-white text-center rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-4 pt-1">
          <button onClick={removePosition} disabled={points.length <= 2} className="text-zinc-600 hover:text-white disabled:opacity-30 text-xs uppercase tracking-wider transition-colors">− Position</button>
          <button onClick={addPosition} className="text-zinc-600 hover:text-white text-xs uppercase tracking-wider transition-colors">+ Position</button>
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-2 rounded-xl transition-colors text-sm uppercase tracking-wider"
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
        <button onClick={handleExport} className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
          Exporter la sauvegarde (.json)
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
          Importer une sauvegarde
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        {status === 'import_ok' && <p className="text-emerald-400 text-xs text-center uppercase tracking-wider">Données importées.</p>}
        {status === 'import_err' && <p className="text-red-400 text-xs text-center uppercase tracking-wider">Fichier invalide.</p>}
        {status === 'reset_ok' && <p className="text-zinc-500 text-xs text-center uppercase tracking-wider">Données effacées.</p>}

        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="w-full bg-zinc-900 border border-zinc-800 hover:border-red-800 text-red-500 text-xs font-bold py-3 rounded-xl transition-colors mt-2 uppercase tracking-wider">
            Réinitialiser tout
          </button>
        ) : (
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 space-y-3">
            <p className="text-red-300 text-xs text-center uppercase tracking-wider">Supprimer toutes les données ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)} className="flex-1 bg-zinc-800 text-zinc-300 text-xs font-bold py-2 rounded-lg uppercase tracking-wider">Annuler</button>
              <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg uppercase tracking-wider">Confirmer</button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

export default function Options() {
  return (
    <div className="space-y-8 pt-4 pb-4">
      <PlayersSection />
      <ActivitiesSection />
      <PointsSection />
      <DataSection />
    </div>
  )
}
