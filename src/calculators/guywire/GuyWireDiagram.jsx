import { useLanguage } from '../../hooks/useLanguage.jsx'

const LEVEL_COLORS = ['#34d399', '#f59e0b', '#f87171', '#a78bfa']
const SVG_W    = 240
const SVG_H    = 260
const MAST_X   = 130   // mast position; leaves ~120 px left for radius, ~110 px right for labels
const GROUND_Y = 220
const TOP_MARGIN = 20
const SIDE_MARGIN = 10

export default function GuyWireDiagram({ config, results }) {
  const { t } = useLanguage()

  if (!results || results.levels.length === 0) return null

  const mastHeightM = config.mastHeight || 1
  const maxRadiusM  = Math.max(...config.levelConfig.slice(0, config.levels).map(l => l.radius), 1)

  // Uniform scale (px per metre) that keeps both mast and wires in view
  const availH = GROUND_Y - TOP_MARGIN          // vertical pixels for mast
  const availW = MAST_X   - SIDE_MARGIN         // horizontal pixels for radius
  const scale  = Math.min(availH / mastHeightM, availW / maxRadiusM)

  const topY = GROUND_Y - mastHeightM * scale

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        {t('diagramTitle')}
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ maxHeight: 280 }}
      >
        {/* Ground line */}
        <line x1="0" y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#334155" strokeWidth="2" />
        <text x={MAST_X} y={GROUND_Y + 14} fill="#475569" fontSize="9" textAnchor="middle">
          {t('ground')}
        </text>

        {/* Mast */}
        <line x1={MAST_X} y1={topY} x2={MAST_X} y2={GROUND_Y} stroke="#60a5fa" strokeWidth="3" />

        {/* Mast top label */}
        <text x={MAST_X + 6} y={topY + 4} fill="#60a5fa" fontSize="8">
          {mastHeightM}m
        </text>

        {/* Guy wires per level */}
        {config.levelConfig.slice(0, config.levels).map((lc, i) => {
          const attachY = GROUND_Y - lc.height * scale
          const anchorX = MAST_X   - lc.radius * scale
          const color   = LEVEL_COLORS[i]
          return (
            <g key={i}>
              {/* Wire line */}
              <line
                x1={MAST_X} y1={attachY}
                x2={anchorX} y2={GROUND_Y}
                stroke={color} strokeWidth="1.5" strokeDasharray="4,2"
              />
              {/* Anchor point on ground */}
              <circle cx={anchorX} cy={GROUND_Y} r="3" fill={color} />
              {/* Attach point on mast */}
              <circle cx={MAST_X} cy={attachY} r="2.5" fill={color} />
              {/* Height label (right of mast) */}
              <text x={MAST_X + 5} y={attachY + 3} fill={color} fontSize="8">
                {lc.height}m
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
