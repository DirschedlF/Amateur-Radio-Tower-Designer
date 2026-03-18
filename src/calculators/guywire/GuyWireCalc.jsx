import { useState, useMemo } from 'react'
import GuyWireInputs from './GuyWireInputs.jsx'
import GuyWireDiagram from './GuyWireDiagram.jsx'
import GuyWireResults from './GuyWireResults.jsx'
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

export default function GuyWireCalc() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const results = useMemo(() => {
    try {
      return calculateGuyWires(config)
    } catch {
      return null
    }
  }, [config])

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <GuyWireInputs config={config} onChange={setConfig} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuyWireDiagram config={config} results={results} />
        <GuyWireResults results={results} />
      </div>
    </div>
  )
}
