import { useState } from 'react'
import { useLanguage } from './hooks/useLanguage.jsx'
import Sidebar from './components/Sidebar.jsx'
import GuyWireCalc from './calculators/guywire/GuyWireCalc.jsx'

const CALC_COMPONENTS = {
  guywire: GuyWireCalc,
}

export default function App() {
  const [activeCalc, setActiveCalc] = useState('guywire')
  const { t, toggleLang } = useLanguage()

  const ActiveCalc = CALC_COMPONENTS[activeCalc]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-xl">📡</span>
          <span className="font-semibold text-slate-100">{t('appTitle')}</span>
        </div>
        <button
          onClick={toggleLang}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
        >
          {t('langToggle')}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCalc={activeCalc} onSelect={setActiveCalc} />
        <main className="flex-1 overflow-auto p-4">
          {ActiveCalc && <ActiveCalc />}
        </main>
      </div>
    </div>
  )
}
