import { useState, useMemo, useEffect } from 'react'
import GuyWireInputs from './GuyWireInputs.jsx'
import GuyWireDiagram from './GuyWireDiagram.jsx'
import GuyWireResults from './GuyWireResults.jsx'
import GuyWireLoad from './GuyWireLoad.jsx'
import { calculateGuyWires } from './guywire.js'
import { calculateGuyWireLoad } from './guywireload.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'

const DEFAULT_CONFIG = {
  mastHeight: 10,
  levels: 1,
  levelConfig: [
    { height: 7, radius: 7, wires: 4 },
    { height: 0, radius: 0, wires: 3 },
    { height: 0, radius: 0, wires: 3 },
  ],
}

export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {} }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const { t } = useLanguage()

  useEffect(() => {
    if (mastHeight === null) return
    setConfig(c => c.mastHeight === mastHeight ? c : { ...c, mastHeight })
  }, [mastHeight])

  function handleConfigChange(newConfig) {
    if (newConfig.mastHeight !== config.mastHeight) onMastHeightChange(newConfig.mastHeight)
    setConfig(newConfig)
  }

  const results = useMemo(() => {
    try {
      return calculateGuyWires(config)
    } catch {
      return null
    }
  }, [config])

  const loadRaw = useMemo(() => {
    if (!windLoadSnapshot || !results) return null
    try {
      return calculateGuyWireLoad({ snapshot: windLoadSnapshot, levelResults: results.levels })
    } catch {
      return null
    }
  }, [windLoadSnapshot, results])

  const loadResult = loadRaw
    ? { levels: loadRaw.levels, q: windLoadSnapshot.q, windSpeed: windLoadSnapshot.windSpeed }
    : null

  useEffect(() => {
    if (results === null) {
      onGuyWireChange(null)
      return
    }
    onGuyWireChange({
      mastHeight: config.mastHeight,
      levels: results.levels,
      grandTotalLength: results.grandTotalLength,
      loadResults: loadRaw?.levels ?? null,
    })
  }, [results, loadRaw]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <GuyWireInputs config={config} onChange={handleConfigChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuyWireDiagram config={config} results={results} />
        <GuyWireResults results={results} />
      </div>

      <GuyWireLoad
        loadResult={loadResult}
        onNavigateToWindLoad={onNavigateToWindLoad}
      />

      <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/40 rounded-lg px-4 py-3 leading-relaxed">
        ⚠️ {t('windLoadDisclaimer')}
      </p>
    </div>
  )
}
