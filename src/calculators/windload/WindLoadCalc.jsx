import { useState, useMemo } from 'react'
import WindLoadInputs from './WindLoadInputs.jsx'
import WindLoadDiagram from './WindLoadDiagram.jsx'
import WindLoadResults from './WindLoadResults.jsx'
import { calculateWindLoad } from './windload.js'

const DEFAULT_CONFIG = {
  windSpeed: 28,
  mast: { height: 12, diamBottomMm: 100, diamTopMm: 60, cw: 1.1 },
  antenna: { area: 0.5, cw: 0.8, mountHeight: 11 },
}

export default function WindLoadCalc() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const results = useMemo(() => {
    try {
      return calculateWindLoad({
        windSpeed: config.windSpeed,
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
    </div>
  )
}
