/**
 * calculateGuyWireLoad — sectional wind load distribution for guyed masts.
 *
 * @param {object} params
 * @param {object} params.snapshot       - Wind load snapshot from WindLoadCalc
 * @param {number} params.snapshot.q                - Dynamic wind pressure (N/m²)
 * @param {number} params.snapshot.mastHeight       - Mast height (m)
 * @param {number} params.snapshot.diamBottomMm     - Mast base diameter (mm)
 * @param {number} params.snapshot.diamTopMm        - Mast top diameter (mm)
 * @param {number} params.snapshot.mastCw           - Mast drag coefficient
 * @param {number} params.snapshot.antennaForce     - Antenna wind force (N), assigned to top level
 * @param {Array}  params.levelResults  - Level results from calculateGuyWires (must include height, radius, angleFromHorizontal, wires)
 *
 * @returns {{ levels: Array }} | null
 */
export function calculateGuyWireLoad({ snapshot, levelResults }) {
  if (!levelResults) return null

  const { q, mastHeight: H, diamBottomMm, diamTopMm, mastCw: cw, antennaForce } = snapshot
  const diamBottom = diamBottomMm / 1000
  const diamTop = diamTopMm / 1000
  const N = levelResults.length

  // Linear diameter interpolation at height z
  function diamAtZ(z) {
    return diamBottom + (diamTop - diamBottom) * z / H
  }

  // Trapezoid wind force on mast section from z_a to z_b
  function sectionWindForce(z_a, z_b) {
    const area = (diamAtZ(z_a) + diamAtZ(z_b)) / 2 * (z_b - z_a)
    return q * cw * area
  }

  // Midpoint-rule section boundaries for level i
  function bounds(i) {
    const lower = i === 0 ? 0 : (levelResults[i - 1].height + levelResults[i].height) / 2
    const upper = i === N - 1 ? H : (levelResults[i].height + levelResults[i + 1].height) / 2
    return { lower, upper }
  }

  const levels = levelResults.map((level, i) => {
    const { lower, upper } = bounds(i)
    const windForce = sectionWindForce(lower, upper)
    const totalForce = i === N - 1 ? windForce + antennaForce : windForce

    const cosAlpha = Math.cos(level.angleFromHorizontal * Math.PI / 180)
    const horizForcePerWire = level.wires > 0 ? totalForce / level.wires : 0
    const tension = level.wires > 0 && cosAlpha > 0
      ? totalForce / (level.wires * cosAlpha)
      : 0

    return {
      sectionForce: windForce,
      horizForcePerWire,
      tension,
      tensionKgf: tension / 9.81,
    }
  })

  return { levels }
}
