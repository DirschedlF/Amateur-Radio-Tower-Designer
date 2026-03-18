import { useLanguage } from '../../hooks/useLanguage.jsx'

const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

function fmt(n, decimals = 2) {
  return n.toFixed(decimals)
}

export default function GuyWireResults({ results }) {
  const { t } = useLanguage()

  if (!results || results.levels.length === 0) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('resultsTitle')}
      </p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-slate-500">
            <th className="text-left pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colLevel')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colWireLength')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colAngleH')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colAngleM')}</th>
            <th className="text-right pb-2 border-b border-slate-700 whitespace-nowrap">{t('colTotalLevel')}</th>
          </tr>
        </thead>
        <tbody>
          {results.levels.map((level, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-slate-900/30' : ''}>
              <td className={`py-2 pr-3 font-medium ${LEVEL_COLORS[i]}`}>
                {i + 1}
              </td>
              <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">
                {fmt(level.wireLength)} {t('unit_m')}
                <span className="text-slate-500 text-xs ml-1">({t('perWire')})</span>
              </td>
              <td className="py-2 pr-3 text-right text-slate-200">
                {fmt(level.angleFromHorizontal, 1)}{t('unit_deg')}
              </td>
              <td className="py-2 pr-3 text-right text-slate-200">
                {fmt(level.angleFromMast, 1)}{t('unit_deg')}
              </td>
              <td className="py-2 text-right text-slate-200">
                {fmt(level.totalLengthPerLevel)} {t('unit_m')}
                <span className="text-slate-500 text-xs ml-1">×{level.wires}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-700">
            <td colSpan="4" className="pt-3 text-slate-400 text-sm">{t('grandTotal')}</td>
            <td className="pt-3 text-right text-blue-400 font-semibold text-sm">
              {fmt(results.grandTotalLength)} {t('unit_m')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
