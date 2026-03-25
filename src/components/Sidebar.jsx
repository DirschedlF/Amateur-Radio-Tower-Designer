import { useLanguage } from '../hooks/useLanguage.jsx'

const CALCULATORS = [
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
  { id: 'windload', labelKey: 'calcWindLoad', subtitleKey: 'calcWindLoadSubtitle', active: true },
  { id: 'spiderbeam', labelKey: 'calcSpiderBeam', subtitleKey: 'calcSpiderBeamSubtitle', active: true },
]

export default function Sidebar({ activeCalc, onSelect, isOpen = false, onClose = () => {} }) {
  const { t } = useLanguage()

  return (
    <aside className={`
  w-44 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col py-3
  fixed inset-y-0 left-0 z-40 transition-transform duration-200
  md:static md:translate-x-0 md:z-auto
  ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
`}>
      <p className="px-3 mb-2 text-xs uppercase tracking-widest text-slate-500">
        {t('sidebarCalculators')}
      </p>

      {CALCULATORS.map(calc => (
        <button
          key={calc.id}
          onClick={() => { onSelect(calc.id); onClose() }}
          className={`mx-2 mb-1 rounded-md px-3 py-2 text-left transition-colors ${
            activeCalc === calc.id
              ? 'bg-blue-700 text-white'
              : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          <div className="text-sm font-medium">{t(calc.labelKey)}</div>
          {calc.subtitleKey && (
            <div className={`text-xs ${activeCalc === calc.id ? 'text-blue-200' : 'text-slate-500'}`}>
              {t(calc.subtitleKey)}
            </div>
          )}
        </button>
      ))}
    </aside>
  )
}
