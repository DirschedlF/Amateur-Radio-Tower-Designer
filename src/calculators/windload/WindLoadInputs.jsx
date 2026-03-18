import { useLanguage } from '../../hooks/useLanguage.jsx'

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

      {/* Wind speed / dynamic pressure.
          windSpeed is canonical state. The q field converts back on blur (not onChange)
          to avoid cursor-jumping during partial input — same known limitation as other
          number fields in this app (see CLAUDE.md: "clearing a field falls back to 0"). */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('windSpeed')} ({t('unit_ms')})
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
          <input
            type="number"
            min="0"
            step="1"
            defaultValue={derivedQ}
            key={derivedQ}
            onBlur={e => {
              const q = parseFloat(e.target.value) || 0
              setTop('windSpeed', parseFloat(Math.sqrt(2 * q / 1.25).toFixed(2)) || 0)
            }}
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
          <label className="block text-xs text-slate-500 mb-1">{t('cwLabel')}</label>
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
          <label className="block text-xs text-slate-500 mb-1">
            {t('mountHeight')} (m)
            <span className="block text-slate-600 normal-case text-xs font-normal leading-tight mt-0.5">
              {t('mountHeightHint')}
            </span>
          </label>
          <input
            type="number" min="0" step="0.5"
            value={config.antenna.mountHeight}
            onChange={e => setAntenna('mountHeight', parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  )
}
