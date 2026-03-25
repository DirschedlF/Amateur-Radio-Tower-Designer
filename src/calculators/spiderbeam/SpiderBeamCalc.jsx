import { useState, useMemo } from 'react'
import { MAST_CONFIGS, calculateSpiderBeam } from './spiderbeam.js'
import SpiderBeamDiagram from './SpiderBeamDiagram.jsx'
import SpiderBeamResults from './SpiderBeamResults.jsx'

// One mast type in scope for this version — no mastType state needed.
const mastConfig = MAST_CONFIGS['14m_hd']

export default function SpiderBeamCalc({
  onConfigureGuyWire = () => {},
  onNavigateToGuyWire = () => {},
}) {
  const [desiredHeight, setDesiredHeight] = useState(mastConfig.segments)
  const [activeGuyLevels, setActiveGuyLevels] = useState([...mastConfig.guyLevels])

  const results = useMemo(
    () => calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }),
    [desiredHeight, activeGuyLevels]
  )

  function handleToggleLevel(segment) {
    setActiveGuyLevels(prev =>
      prev.includes(segment) ? prev.filter(n => n !== segment) : [...prev, segment]
    )
  }

  function handleHeightChange(newHeight) {
    // Deactivate attachment points that become unavailable at the new height.
    // Recalculate availability with current activeGuyLevels, then filter.
    const next = calculateSpiderBeam({ mastConfig, desiredHeight: newHeight, activeGuyLevels })
    const availableSegments = next.attachmentPoints.filter(p => p.available).map(p => p.segment)
    setActiveGuyLevels(prev => prev.filter(n => availableSegments.includes(n)))
    setDesiredHeight(newHeight)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpiderBeamDiagram config={{ desiredHeight }} results={results} />
        <SpiderBeamResults
          results={results}
          mastConfig={mastConfig}
          desiredHeight={desiredHeight}
          onHeightChange={handleHeightChange}
          onToggleLevel={handleToggleLevel}
          onConfigureGuyWire={onConfigureGuyWire}
          onNavigateToGuyWire={onNavigateToGuyWire}
        />
      </div>
    </div>
  )
}
