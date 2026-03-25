/**
 * SpiderBeamDiagram — SVG side view of the Spiderbeam telescoping mast.
 *
 * Layout (left to right in SVG):
 *   - Height axis with tick labels (left side)
 *   - Grundrohr: blue filled rect at base (0–1 m)
 *   - Eingezogene Segmente: dashed overlay inside Grundrohr
 *   - Active mast: trapezoid (konisch), wider at bottom, narrower at top
 *   - Attachment points: yellow circle + horizontal line when active,
 *     grey circle + dashed line when deactivated
 *   - Guy wire lines: symbolic, fixed 60 px horizontal offset (not to scale)
 *   - Segment labels on the right side of each attachment point
 */

const SVG_W = 220
const SVG_H = 360
const AXIS_X = 38
const MAST_CX = 120
const MARGIN_TOP = 22
const MARGIN_BOTTOM = 32

const MAST_W_BOTTOM = 54   // px width of mast at 1 m (top of Grundrohr)
const MAST_W_TOP = 8       // px width of mast at desiredHeight
const GUY_OFFSET = 60      // symbolic horizontal distance for guy wire lines

export default function SpiderBeamDiagram({ config, results }) {
  const { desiredHeight } = config
  const { inGroundtube, activeSegments, attachmentPoints } = results

  const drawH = SVG_H - MARGIN_TOP - MARGIN_BOTTOM
  const scale = drawH / desiredHeight   // px per meter
  const groundY = SVG_H - MARGIN_BOTTOM

  function yOf(meters) {
    return groundY - meters * scale
  }

  function mastWidthAt(meters) {
    const frac = meters / desiredHeight
    return MAST_W_BOTTOM + (MAST_W_TOP - MAST_W_BOTTOM) * frac
  }

  // Grundrohr: segment 1, height 0–1 m
  const groundtubeTopY = yOf(1)
  const groundtubeH = groundY - groundtubeTopY

  // Active mast trapezoid: from 1 m to desiredHeight
  const wBottom = mastWidthAt(1)
  const wTop = mastWidthAt(desiredHeight)
  const trapPoints = [
    `${MAST_CX - wBottom / 2},${yOf(1)}`,
    `${MAST_CX + wBottom / 2},${yOf(1)}`,
    `${MAST_CX + wTop / 2},${yOf(desiredHeight)}`,
    `${MAST_CX - wTop / 2},${yOf(desiredHeight)}`,
  ].join(' ')

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 flex flex-col">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
        Seitenansicht · {desiredHeight} m
      </p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Ground */}
        <line x1={10} y1={groundY} x2={SVG_W - 10} y2={groundY} stroke="#475569" strokeWidth={2} />
        <text x={MAST_CX} y={groundY + 14} textAnchor="middle" fontSize={9} fill="#64748b">0 m</text>

        {/* Height axis */}
        <line x1={AXIS_X} y1={groundY} x2={AXIS_X} y2={MARGIN_TOP}
          stroke="#1e3a5f" strokeWidth={1} strokeDasharray="2,4" />

        {/* Grundrohr */}
        <rect x={MAST_CX - MAST_W_BOTTOM / 2} y={groundtubeTopY}
          width={MAST_W_BOTTOM} height={groundtubeH}
          rx={2} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={MAST_CX} y={groundtubeTopY - 4} textAnchor="middle" fontSize={8} fill="#60a5fa">
          Grundrohr · Seg. 1
        </text>

        {/* Eingezogene Segmente (dashed overlay) */}
        {inGroundtube.length > 0 && (
          <rect x={MAST_CX - MAST_W_BOTTOM / 2 + 4} y={groundtubeTopY + 2}
            width={MAST_W_BOTTOM - 8} height={groundtubeH - 4}
            rx={1} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="3,2" />
        )}

        {/* Active mast trapezoid */}
        {activeSegments.length > 0 && (
          <polygon points={trapPoints} fill="#334155" stroke="#60a5fa" strokeWidth={1.5} />
        )}

        {/* Attachment points */}
        {attachmentPoints.map(({ segment, height, available, active }) => {
          if (!available) return null
          const py = yOf(height)
          const hw = mastWidthAt(height) / 2 + 4  // half-width with small margin

          return (
            <g key={segment}>
              <line x1={MAST_CX - hw} y1={py} x2={MAST_CX + hw} y2={py}
                stroke={active ? '#f59e0b' : '#475569'}
                strokeWidth={active ? 2 : 1.5}
                strokeDasharray={active ? undefined : '3,2'} />
              <circle cx={MAST_CX} cy={py} r={5}
                fill={active ? '#f59e0b' : '#1e293b'}
                stroke={active ? '#fbbf24' : '#475569'} strokeWidth={1.5} />
              {active && (
                <>
                  <line x1={MAST_CX} y1={py} x2={MAST_CX - GUY_OFFSET} y2={groundY}
                    stroke="#f59e0b" strokeWidth={1} opacity={0.5} strokeDasharray="5,3" />
                  <line x1={MAST_CX} y1={py} x2={MAST_CX + GUY_OFFSET} y2={groundY}
                    stroke="#f59e0b" strokeWidth={1} opacity={0.5} strokeDasharray="5,3" />
                </>
              )}
              <text x={AXIS_X - 4} y={py + 3} textAnchor="end" fontSize={9}
                fill={active ? '#f59e0b' : '#64748b'}>{height} m</text>
              <text x={MAST_CX + hw + 6} y={py + 3} fontSize={9}
                fill={active ? '#f59e0b' : '#64748b'}>Seg. {segment}</text>
            </g>
          )
        })}

        {/* Top label */}
        <text x={MAST_CX} y={MARGIN_TOP - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">
          ▲ {desiredHeight} m
        </text>
      </svg>
    </div>
  )
}
