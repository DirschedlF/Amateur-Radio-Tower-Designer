import { useLanguage } from '../hooks/useLanguage.js'

const CALCULATORS = [
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
]

const COMING_SOON = [
  { id: 'windload', labelKey: 'calcWindLoad' },
  { id: 'grounding', labelKey: 'calcGrounding' },
]

export default function Sidebar({ activeCalc, onSelect }) {
  const { t } = useLanguage()

  return (
    <aside className="w-44 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col py-3">
      <p className="px-3 mb-2 text-xs uppercase tracking-widest text-slate-500">
        {t('sidebarCalculators')}
      </p>

      {CALCULATORS.map(calc => (
        <button
          key={calc.id}
          onClick={() => onSelect(calc.id)}
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

      <p className="px-3 mt-4 mb-2 text-xs uppercase tracking-widest text-slate-500">
        {t('sidebarComingSoon')}
      </p>

      {COMING_SOON.map(calc => (
        <div
          key={calc.id}
          className="mx-2 mb-1 rounded-md px-3 py-2 opacity-35 cursor-default"
        >
          <div className="text-sm text-slate-400">{t(calc.labelKey)}</div>
        </div>
      ))}
    </aside>
  )
}
