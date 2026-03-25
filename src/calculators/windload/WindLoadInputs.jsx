import { useLanguage } from '../../hooks/useLanguage.jsx'
import Tooltip from '../../components/Tooltip.jsx'

const WIND_SPEED_ROWS = [
  { key: 'windSpeedTooltipRow1', ms: '5–8',   bft: '3–4' },
  { key: 'windSpeedTooltipRow2', ms: '10–15', bft: '5–6' },
  { key: 'windSpeedTooltipRow3', ms: '20–25', bft: '8–9' },
  { key: 'windSpeedTooltipRow4', ms: '22,5',  bft: '9',  highlight: true },
]

const CW_ROWS = [
  { key: 'cwTooltipRow1', cw: '0,04–0,1' },
  { key: 'cwTooltipRow2', cw: '0,47' },
  { key: 'cwTooltipRow3', cw: '1,0–1,2', highlight: true },
  { key: 'cwTooltipRow4', cw: '1,3–2,0' },
  { key: 'cwTooltipRow5', cw: '1,8–2,0' },
]

function WindSpeedTooltipContent({ t }) {
  return (
    <>
      <p className="font-semibold text-slate-200 mb-2">{t('windSpeedTooltipTitle')}</p>
      <table className="w-full border-collapse mb-2">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left pr-2 pb-1 font-normal">m/s</th>
            <th className="text-left pr-2 pb-1 font-normal">Bft</th>
            <th className="text-left pb-1 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {WIND_SPEED_ROWS.map(row => (
            <tr key={row.key} className={row.highlight ? 'text-amber-400' : 'text-slate-300'}>
              <td className="pr-2 py-0.5 tabular-nums whitespace-nowrap">{row.ms}</td>
              <td className="pr-2 py-0.5 tabular-nums">{row.bft}</td>
              <td className="py-0.5 leading-tight">{t(row.key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-400 leading-tight">{t('windSpeedTooltipNote')}</p>
    </>
  )
}

function GustFactorTooltipContent({ t }) {
  return (
    <>
      <p className="font-semibold text-slate-200 mb-2">{t('gustFactorTooltipTitle')}</p>
      <p className="text-slate-300 leading-tight">{t('gustFactorTooltipText')}</p>
    </>
  )
}

function CwTooltipContent({ t }) {
  return (
    <>
      <p className="font-semibold text-slate-200 mb-2">{t('cwTooltipTitle')}</p>
      <table className="w-full border-collapse mb-2">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left pr-3 pb-1 font-normal"></th>
            <th className="text-left pb-1 font-normal">cw</th>
          </tr>
        </thead>
        <tbody>
          {CW_ROWS.map(row => (
            <tr key={row.key} className={row.highlight ? 'text-amber-400' : 'text-slate-300'}>
              <td className="pr-3 py-0.5 leading-tight">{t(row.key)}</td>
              <td className="py-0.5 tabular-nums whitespace-nowrap">{row.cw}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-400 leading-tight">{t('cwTooltipNote')}</p>
    </>
  )
}

const INPUT_CLASS =
  'w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500'

export default function WindLoadInputs({ config, onChange }) {
  const { t } = useLanguage()

  const derivedQ = parseFloat((0.5 * 1.25 * config.windSpeed ** 2).toFixed(1))

  function setTop(field, value) {
    onChange({ ...config, [field]: value })
  }

  function setMast(field, value) {
    onChange({ ...config, mast: { ...config.mast, [field]: value } })
  }

  function setAntenna(field, value) {
    onChange({ ...config, antenna: { ...config.antenna, [field]: value } })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('windSection')}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('windSpeed')} ({t('unit_ms')})
            <Tooltip content={<WindSpeedTooltipContent t={t} />} />
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={config.windSpeed}
            onChange={e => setTop('windSpeed', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('dynamicPressure')} ({t('unit_nm2')})
          </label>
          <div className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-400 tabular-nums">
            {derivedQ}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('gustFactor')}
            <Tooltip content={<GustFactorTooltipContent t={t} />} />
          </label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={config.gustFactor}
            onChange={e => setTop('gustFactor', parseFloat(e.target.value) || 1)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Mast */}
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 border-t border-slate-700 pt-3">
        {t('mastSection')}
      </p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('mastHeight')} (m)</label>
          <input
            type="number" min="0" step="0.5"
            value={config.mast.height}
            onChange={e => setMast('height', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('diamBottom')} ({t('unit_mm')})</label>
          <input
            type="number" min="0" step="5"
            value={config.mast.diamBottomMm}
            onChange={e => setMast('diamBottomMm', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('diamTop')} ({t('unit_mm')})</label>
          <input
            type="number" min="0" step="5"
            value={config.mast.diamTopMm}
            onChange={e => setMast('diamTopMm', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('cwLabel')}
            <Tooltip content={<CwTooltipContent t={t} />} align="right" />
          </label>
          <input
            type="number" min="0" step="0.05"
            value={config.mast.cw}
            onChange={e => setMast('cw', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Antenna */}
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 border-t border-slate-700 pt-3">
        {t('antennaSection')}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('antennaArea')} ({t('unit_m2')})</label>
          <input
            type="number" min="0" step="0.1"
            value={config.antenna.area}
            onChange={e => setAntenna('area', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('cwLabel')}</label>
          <input
            type="number" min="0" step="0.05"
            value={config.antenna.cw}
            onChange={e => setAntenna('cw', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('mountHeight')} (m)</label>
          <input
            type="number" min="0" step="0.5"
            value={config.antenna.mountHeight}
            onChange={e => setAntenna('mountHeight', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
          <span className="block text-slate-600 text-xs leading-tight mt-1">
            {t('mountHeightHint')}
          </span>
        </div>
      </div>
    </div>
  )
}
