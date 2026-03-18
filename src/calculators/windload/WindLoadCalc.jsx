import { useState, useMemo, useEffect } from 'react'
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

export default function WindLoadCalc({ onWindLoadChange = () => {} }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const { t } = useLanguage()

  const memoised = useMemo(() => {
    try {
      const results = calculateWindLoad({
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
      const snapshot = {
        q: results.q,
        windSpeed: config.windSpeed,
        mastHeight: config.mast.height,
        diamBottomMm: config.mast.diamBottomMm,
        diamTopMm: config.mast.diamTopMm,
        mastCw: config.mast.cw,
        antennaForce: results.antenna.force,
        antennaMountHeight: config.antenna.mountHeight,
      }
      return { results, snapshot }
    } catch {
      return null
    }
  }, [config])

  useEffect(() => {
    if (memoised?.snapshot) onWindLoadChange(memoised.snapshot)
  }, [memoised]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <WindLoadInputs config={config} onChange={setConfig} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WindLoadDiagram config={config} results={memoised?.results ?? null} />
        <WindLoadResults results={memoised?.results ?? null} />
      </div>

      <p className="text-xs text-slate-500 border border-slate-700 rounded-lg px-4 py-3 leading-relaxed">
        ⚠️ {t('windLoadDisclaimer')}
      </p>
    </div>
  )
}
