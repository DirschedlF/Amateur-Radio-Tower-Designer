import { useLanguage } from '../../hooks/useLanguage.jsx'

const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

function fmt(n, decimals = 0) {
  return n.toFixed(decimals)
}

export default function GuyWireLoad({ loadResult, onNavigateToWindLoad }) {
  const { t } = useLanguage()

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('loadSectionTitle')}
      </p>

      {!loadResult ? (
        <div className="flex items-center gap-3 border border-dashed border-slate-600 rounded-lg px-4 py-3">
          <span className="text-slate-500 text-lg">⚡</span>
          <p className="text-sm text-slate-400 flex-1">{t('loadRequiredHint')}</p>
          <button
            onClick={onNavigateToWindLoad}
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded px-2 py-1 transition-colors whitespace-nowrap"
          >
            {t('loadGoToWindLoad')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">
              q = {fmt(loadResult.q, 0)} N/m² · v = {fmt(loadResult.windSpeed, 0)} m/s
            </span>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="text-left pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                  {t('colLevel')}
                </th>
                <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                  {t('colSectionForce')}
                </th>
                <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                  {t('colHorizPerWire')}
                </th>
                <th className="text-right pb-2 border-b border-slate-700 whitespace-nowrap">
                  {t('colTension')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loadResult.levels.map((level, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-900/30' : ''}>
                  <td className={`py-2 pr-3 font-medium ${LEVEL_COLORS[i]}`}>
                    {i + 1}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">
                    {fmt(level.sectionForce)} N
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">
                    {fmt(level.horizForcePerWire)} N
                  </td>
                  <td className="py-2 text-right text-slate-200 whitespace-nowrap">
                    {fmt(level.tension)} N
                    <span className="text-slate-500 text-xs ml-1">
                      ({fmt(level.tensionKgf, 1)} kg)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/40 rounded-lg px-3 py-2 mt-4 leading-relaxed">
            ⚠️ {t('loadDisclaimer')}
          </p>
          <p className="text-xs text-slate-500 border border-slate-700 rounded-lg px-3 py-2 mt-2 leading-relaxed">
            💡 {t('loadBreakingLoadHint')}
          </p>
        </>
      )}
    </div>
  )
}
