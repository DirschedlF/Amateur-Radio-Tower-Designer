import { useState, useMemo, useEffect } from 'react'
import GuyWireInputs from './GuyWireInputs.jsx'
import GuyWireDiagram from './GuyWireDiagram.jsx'
import GuyWireResults from './GuyWireResults.jsx'
import GuyWireLoad from './GuyWireLoad.jsx'
import { calculateGuyWires } from './guywire.js'

const DEFAULT_CONFIG = {
  mastHeight: 12,
  levels: 2,
  levelConfig: [
    { height: 6,  radius: 5,  wires: 3 },
    { height: 11, radius: 8,  wires: 3 },
    { height: 0,  radius: 0,  wires: 3 },
  ],
}

export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {} }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

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

  return (
    <div className="flex flex-col gap-4">
      <GuyWireInputs config={config} onChange={handleConfigChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuyWireDiagram config={config} results={results} />
        <GuyWireResults results={results} />
      </div>

      <GuyWireLoad
        windLoadSnapshot={windLoadSnapshot}
        geoResults={results}
        onNavigateToWindLoad={onNavigateToWindLoad}
      />
    </div>
  )
}
