import { useLanguage } from '../../hooks/useLanguage.jsx'

function fmt(n, decimals = 1) {
  return n.toFixed(decimals)
}

export default function WindLoadResults({ results }) {
  const { t } = useLanguage()

  if (!results) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('windLoadResultsTitle')}
      </p>

      <div className="mb-3 text-sm">
        <span className="text-slate-500">{t('dynamicPressure')}: </span>
        <span className="text-slate-100 font-medium">
          {fmt(results.q)} {t('unit_nm2')}
        </span>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-slate-500">
            <th className="text-left pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colComponent')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colForce')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">{t('colMomentArm')}</th>
            <th className="text-right pb-2 border-b border-slate-700 whitespace-nowrap">{t('colMoment')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 pr-3 font-medium text-emerald-400">{t('rowMast')}</td>
            <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">{fmt(results.mast.force)} {t('unit_n')}</td>
            <td className="py-2 pr-3 text-right text-slate-200">{fmt(results.mast.momentArm)} {t('unit_m')}</td>
            <td className="py-2 text-right text-slate-200 whitespace-nowrap">{fmt(results.mast.moment)} {t('unit_nm')}</td>
          </tr>
          <tr className="bg-slate-900/30">
            <td className="py-2 pr-3 font-medium text-amber-400">{t('rowAntenna')}</td>
            <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">{fmt(results.antenna.force)} {t('unit_n')}</td>
            <td className="py-2 pr-3 text-right text-slate-500">—</td>
            <td className="py-2 text-right text-slate-200 whitespace-nowrap">{fmt(results.antenna.moment)} {t('unit_nm')}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-700">
            <td className="pt-3 text-slate-400 text-sm">{t('rowTotal')}</td>
            <td className="pt-3 text-right text-blue-400 font-semibold whitespace-nowrap">
              {fmt(results.total.force)} {t('unit_n')}
            </td>
            <td className="pt-3"></td>
            <td className="pt-3 text-right text-blue-400 font-semibold whitespace-nowrap">
              {fmt(results.total.moment)} {t('unit_nm')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
