import { useState, useMemo } from 'react'
import WindLoadInputs from './WindLoadInputs.jsx'
import WindLoadDiagram from './WindLoadDiagram.jsx'
import WindLoadResults from './WindLoadResults.jsx'
import { calculateWindLoad } from './windload.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'

const DEFAULT_CONFIG = {
  windSpeed: 28,
  gustFactor: 1.7,
  mast: { height: 12, diamBottomMm: 100, diamTopMm: 60, cw: 1.1 },
  antenna: { area: 0.5, cw: 0.8, mountHeight: 11 },
}

export default function WindLoadCalc() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const { t } = useLanguage()

  const results = useMemo(() => {
    try {
      return calculateWindLoad({
        windSpeed: config.windSpeed,
        gustFactor: config.gustFactor,
        mast: {
          height: config.mast.height,
          diamBottom: config.mast.diamBottomMm / 1000,
          diamTop: config.mast.diamTopMm / 1000,
          cw: config.mast.cw,
        },
        antenna: config.antenna,
      })
    } catch {
      return null
    }
  }, [config])

  return (
    <div className="flex flex-col gap-4">
      <WindLoadInputs config={config} onChange={setConfig} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WindLoadDiagram config={config} results={results} />
        <WindLoadResults results={results} />
      </div>

      <p className="text-xs text-slate-500 border border-slate-700 rounded-lg px-4 py-3 leading-relaxed">
        ⚠️ {t('windLoadDisclaimer')}
      </p>
    </div>
  )
}
