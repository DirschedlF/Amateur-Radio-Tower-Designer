import { useState, useEffect } from 'react'
import { useLanguage } from './hooks/useLanguage.jsx'
import Sidebar from './components/Sidebar.jsx'
import GuyWireCalc from './calculators/guywire/GuyWireCalc.jsx'
import WindLoadCalc from './calculators/windload/WindLoadCalc.jsx'
import ReportButton from './components/ReportButton.jsx'
import SpiderBeamCalc from './calculators/spiderbeam/SpiderBeamCalc.jsx'

export default function App() {
  const [activeCalc, setActiveCalc] = useState('guywire')
  const [windLoadSnapshot, setWindLoadSnapshot] = useState(null)
  const [guyWireSnapshot, setGuyWireSnapshot] = useState(null)
  const [sharedMastHeight, setSharedMastHeight] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingPrefill, setPendingPrefill] = useState(null)
  const [confirmedPrefill, setConfirmedPrefill] = useState(null)
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
          <span className="text-xs text-slate-500 font-mono">v0.5.0</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/DirschedlF/Amateur-Radio-Tower-Designer/blob/master/docs/Benutzerhandbuch.md"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
          >
            {t('handbuchLink')}
          </a>
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
        <main className="flex-1 overflow-auto p-4 flex flex-col">
          <div className={activeCalc === 'guywire' ? '' : 'hidden'}>
            <GuyWireCalc
              windLoadSnapshot={windLoadSnapshot}
              onNavigateToWindLoad={() => setActiveCalc('windload')}
              mastHeight={sharedMastHeight}
              onMastHeightChange={setSharedMastHeight}
              onGuyWireChange={setGuyWireSnapshot}
              prefill={confirmedPrefill}
            />
          </div>
          <div className={activeCalc === 'windload' ? '' : 'hidden'}>
            <WindLoadCalc
              onWindLoadChange={setWindLoadSnapshot}
              mastHeight={sharedMastHeight}
              onMastHeightChange={setSharedMastHeight}
            />
          </div>
          <div className={activeCalc === 'spiderbeam' ? '' : 'hidden'}>
            <SpiderBeamCalc
              onConfigureGuyWire={setPendingPrefill}
              onNavigateToGuyWire={() => setActiveCalc('guywire')}
            />
          </div>
          {pendingPrefill && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
                <h2 className="text-base font-semibold text-slate-100">{t('spiderBeamConfirmTitle')}</h2>
                <p className="text-sm text-slate-400">{t('spiderBeamConfirmBody')}</p>
                <div className="text-sm bg-slate-700/50 rounded-lg px-4 py-3 flex flex-col gap-1">
                  <div>
                    <span className="text-slate-500">Masthöhe: </span>
                    <span className="text-slate-200 font-semibold">{pendingPrefill.mastHeight} m</span>
                  </div>
                  {pendingPrefill.levels.map((lvl, i) => (
                    <div key={lvl.segment}>
                      <span className="text-slate-500">Ebene {i + 1}: </span>
                      <span className="text-slate-200">{lvl.height} m</span>
                      <span className="text-slate-500 text-xs"> (Seg. {lvl.segment})</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setPendingPrefill(null)}
                    className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                  >
                    {t('spiderBeamConfirmCancel')}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmedPrefill(pendingPrefill)
                      setActiveCalc('guywire')
                      setPendingPrefill(null)
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-600 rounded-md transition-colors"
                  >
                    {t('spiderBeamConfirmYes')}
                  </button>
                </div>
              </div>
            </div>
          )}
          <footer className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Fritz Dirschedl · DK9RC</span>
            <a
              href="https://github.com/DirschedlF/Amateur-Radio-Tower-Designer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              GitHub
            </a>
            <span>{t('footerLicense')}</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
