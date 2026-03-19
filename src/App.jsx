import { useState, useEffect } from 'react'
import { useLanguage } from './hooks/useLanguage.jsx'
import Sidebar from './components/Sidebar.jsx'
import GuyWireCalc from './calculators/guywire/GuyWireCalc.jsx'
import WindLoadCalc from './calculators/windload/WindLoadCalc.jsx'
import ReportButton from './components/ReportButton.jsx'

export default function App() {
  const [activeCalc, setActiveCalc] = useState('guywire')
  const [windLoadSnapshot, setWindLoadSnapshot] = useState(null)
  const [guyWireSnapshot, setGuyWireSnapshot] = useState(null)
  const [sharedMastHeight, setSharedMastHeight] = useState(12)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { t, toggleLang } = useLanguage()

  useEffect(() => {
    if (!drawerOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-slate-400 hover:text-slate-100 text-xl px-1"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-amber-400 text-xl">📡</span>
          <span className="font-semibold text-slate-100">{t('appTitle')}</span>
          <span className="text-xs text-slate-500 font-mono">v0.3.0</span>
        </div>
        <div className="flex items-center gap-2">
          <ReportButton
            windSnapshot={windLoadSnapshot}
            guyWireSnapshot={guyWireSnapshot}
            onCloseDrawer={() => setDrawerOpen(false)}
          />
          <button
            onClick={toggleLang}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
          >
            {t('langToggle')}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <Sidebar
          activeCalc={activeCalc}
          onSelect={setActiveCalc}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main className="flex-1 overflow-auto p-4">
          <div className={activeCalc === 'guywire' ? '' : 'hidden'}>
            <GuyWireCalc
              windLoadSnapshot={windLoadSnapshot}
              onNavigateToWindLoad={() => setActiveCalc('windload')}
              mastHeight={sharedMastHeight}
              onMastHeightChange={setSharedMastHeight}
              onGuyWireChange={setGuyWireSnapshot}
            />
          </div>
          <div className={activeCalc === 'windload' ? '' : 'hidden'}>
            <WindLoadCalc
              onWindLoadChange={setWindLoadSnapshot}
              mastHeight={sharedMastHeight}
              onMastHeightChange={setSharedMastHeight}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
