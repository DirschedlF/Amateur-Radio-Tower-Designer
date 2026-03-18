import { useLanguage } from '../../hooks/useLanguage.jsx'

const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

export default function GuyWireInputs({ config, onChange }) {
  const { t } = useLanguage()

  function setField(field, value) {
    onChange({ ...config, [field]: value })
  }

  function setLevelField(index, field, value) {
    const levelConfig = config.levelConfig.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    )
    onChange({ ...config, levelConfig })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('sidebarCalculators')} / Inputs
      </p>

      {/* Global settings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Mast height */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('mastHeight')} (m)</label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={config.mastHeight}
            onChange={e => setField('mastHeight', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Number of levels */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('levels')}</label>
          <div className="flex gap-1">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setField('levels', n)}
                className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                  config.levels === n
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-900 border border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Per-level settings */}
      <div className="border-t border-slate-700 pt-3">
        <div className="grid grid-cols-4 gap-2 mb-1 text-xs text-slate-500">
          <span>{t('levelLabel')}</span>
          <span>{t('heightLabel')}</span>
          <span>{t('radiusLabel')}</span>
          <span>{t('wiresLabel')}</span>
        </div>

        {Array.from({ length: config.levels }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
            <span className={`text-sm font-medium ${LEVEL_COLORS[i]}`}>
              {t('levelLabel')} {i + 1}
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.levelConfig[i].height}
              onChange={e => setLevelField(i, 'height', parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.levelConfig[i].radius}
              onChange={e => setLevelField(i, 'radius', parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-1">
              {[3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setLevelField(i, 'wires', n)}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                    config.levelConfig[i].wires === n
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-900 border border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
