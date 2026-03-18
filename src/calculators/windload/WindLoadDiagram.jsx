import { useLanguage } from '../../hooks/useLanguage.jsx'

const SVG_W = 280
const SVG_H = 220
const MARGIN = { top: 20, bottom: 30, left: 20, right: 80 }
const DRAW_H = SVG_H - MARGIN.top - MARGIN.bottom
const MAST_X = 80   // centerline x

export default function WindLoadDiagram({ config, results }) {
  const { t } = useLanguage()
  if (!results) return null

  const mastHeight = config.mast.height || 1
  const rBottom = (config.mast.diamBottomMm / 1000 / 2) || 0.01
  const rTop = (config.mast.diamTopMm / 1000 / 2) || 0.005

  // Scale: map mastHeight → DRAW_H
  const scale = DRAW_H / mastHeight
  const toY = h => MARGIN.top + DRAW_H - h * scale

  const baseY = toY(0)
  const topY = toY(mastHeight)
  const maxR = Math.max(rBottom, rTop)
  const rScale = Math.min(40, 40 / maxR) // px per meter, max 40px radius
  const pxBottom = rBottom * rScale
  const pxTop = rTop * rScale

  // Mast trapezoid points
  const mastLeft = [
    `${MAST_X - pxBottom},${baseY}`,
    `${MAST_X - pxTop},${topY}`,
  ]
  const mastRight = [
    `${MAST_X + pxTop},${topY}`,
    `${MAST_X + pxBottom},${baseY}`,
  ]
  const mastPoly = [...mastLeft, ...mastRight].join(' ')

  // Force arrows
  const mastArmY = toY(results.mast.momentArm)
  const antennaY = toY(config.antenna.mountHeight)
  const arrowLen = 50
  const arrowX = MAST_X + pxTop + 6

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        {t('windLoadDiagramTitle')}
      </p>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
        {/* defs first — marker forward-references fail on some iOS Safari versions */}
        <defs>
          <marker id="arrowMast" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M6,0 L6,6 L0,3 z" fill="#34d399" />
          </marker>
          <marker id="arrowAntenna" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M6,0 L6,6 L0,3 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Ground line */}
        <line x1={20} y1={baseY} x2={SVG_W - 20} y2={baseY} stroke="#475569" strokeWidth="1.5" />
        <text x={SVG_W / 2} y={baseY + 14} textAnchor="middle" fontSize="10" fill="#64748b">{t('ground')}</text>

        {/* Mast outline */}
        <polygon points={mastPoly} fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Mast force arrow */}
        {results.mast.force > 0 && (
          <g>
            <line
              x1={arrowX + arrowLen} y1={mastArmY}
              x2={arrowX + 4} y2={mastArmY}
              stroke="#34d399" strokeWidth="1.5"
              markerEnd="url(#arrowMast)"
            />
            <text x={arrowX + arrowLen + 3} y={mastArmY + 4} fontSize="9" fill="#34d399">
              {results.mast.force.toFixed(0)} N
            </text>
          </g>
        )}

        {/* Antenna force arrow */}
        {results.antenna.force > 0 && (
          <g>
            <circle cx={MAST_X} cy={antennaY} r={4} fill="#fbbf24" />
            <line
              x1={arrowX + arrowLen} y1={antennaY}
              x2={arrowX + 4} y2={antennaY}
              stroke="#fbbf24" strokeWidth="1.5"
              markerEnd="url(#arrowAntenna)"
            />
            <text x={arrowX + arrowLen + 3} y={antennaY + 4} fontSize="9" fill="#fbbf24">
              {results.antenna.force.toFixed(0)} N
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
