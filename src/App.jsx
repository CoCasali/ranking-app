import { useState } from 'react'
import Rankings from './pages/Rankings'
import NewResult from './pages/NewResult'
import Draw from './pages/Draw'
import Options from './pages/Options'

const TABS = [
  { id: 'rankings', label: '🏆', title: 'Classement' },
  { id: 'results',  label: '🎯', title: 'Résultats' },
  { id: 'draw',     label: '🎲', title: 'Tirage' },
  { id: 'options',  label: '⚙️', title: 'Options' },
]

export default function App() {
  const [tab, setTab] = useState('rankings')

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-lg mx-auto">
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {TABS.find(t => t.id === tab)?.title}
        </h1>
      </header>

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {tab === 'rankings' && <Rankings />}
        {tab === 'results'  && <NewResult onSaved={() => setTab('rankings')} />}
        {tab === 'draw'     && <Draw />}
        {tab === 'options'  && <Options />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-800 border-t border-slate-700 flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              tab === t.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl">{t.label}</span>
            <span className="text-xs font-medium">{t.title}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
