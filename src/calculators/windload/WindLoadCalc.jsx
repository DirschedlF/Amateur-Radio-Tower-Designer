import { useState, useMemo, useEffect } from 'react'
import WindLoadInputs from './WindLoadInputs.jsx'
import WindLoadDiagram from './WindLoadDiagram.jsx'
import WindLoadResults from './WindLoadResults.jsx'
import { calculateWindLoad } from './windload.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'

const DEFAULT_CONFIG = {
  windSpeed: 15,
  gustFactor: 1.7,
  mast: { height: 10, diamBottomMm: 80, diamTopMm: 20, cw: 1.1 },
  antenna: { area: 0.2, cw: 0.8, mountHeight: 10 },
}

export default function WindLoadCalc({ onWindLoadChange = () => {}, mastHeight = null, onMastHeightChange = () => {} }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const { t } = useLanguage()

  useEffect(() => {
    if (mastHeight === null) return
    setConfig(c => {
      if (c.mast.height === mastHeight) return c
      // If antenna was at (or above) mast top, keep it at the new top.
      // Otherwise just clamp downward — don't raise a deliberately lowered antenna.
      const wasAtTop = c.antenna.mountHeight >= c.mast.height
      const newMount = wasAtTop ? mastHeight : Math.min(c.antenna.mountHeight, mastHeight)
      return { ...c, mast: { ...c.mast, height: mastHeight }, antenna: { ...c.antenna, mountHeight: newMount } }
    })
  }, [mastHeight])

  function handleConfigChange(newConfig) {
    const clampedMount = Math.min(newConfig.antenna.mountHeight, newConfig.mast.height)
    const final = clampedMount === newConfig.antenna.mountHeight
      ? newConfig
      : { ...newConfig, antenna: { ...newConfig.antenna, mountHeight: clampedMount } }
    if (final.mast.height !== config.mast.height) onMastHeightChange(final.mast.height)
    setConfig(final)
  }

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
        // New fields for report
        antennaArea: config.antenna.area,
        antennaCw: config.antenna.cw,
        mastForce: results.mast.force,
        mastMoment: results.mast.moment,
        totalForce: results.total.force,
        totalMoment: results.total.moment,
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
      <WindLoadInputs config={config} onChange={handleConfigChange} />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
        <WindLoadDiagram config={config} results={memoised?.results ?? null} />
        <WindLoadResults results={memoised?.results ?? null} />
      </div>

      <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/40 rounded-lg px-4 py-3 leading-relaxed">
        ⚠️ {t('windLoadDisclaimer')}
      </p>
    </div>
  )
}
