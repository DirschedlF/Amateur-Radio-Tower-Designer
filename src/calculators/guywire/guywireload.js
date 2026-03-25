/**
 * calculateGuyWireLoad — moment-based wind load distribution for guyed masts.
 *
 * Each guy wire level must resist the overturning moment of the wind on its
 * tributary mast section. The horizontal force at level i is:
 *
 *   R_i = M_section_i / h_i
 *
 * where M_section_i is the moment of the wind force on the section about the
 * mast base (z = 0), and h_i is the attachment height. This ensures that a
 * higher attachment (greater lever arm) results in a lower required guy force —
 * the physically correct behaviour for a mast with a pinned base.
 *
 * The antenna contributes F_antenna × antennaMountHeight to the top-level
 * moment, so its actual mounting position is taken into account.
 *
 * @param {object} params
 * @param {object} params.snapshot              - Wind load snapshot from WindLoadCalc
 * @param {number} params.snapshot.q                     - Dynamic wind pressure (N/m²)
 * @param {number} params.snapshot.mastHeight            - Mast height H (m)
 * @param {number} params.snapshot.diamBottomMm          - Mast base diameter (mm)
 * @param {number} params.snapshot.diamTopMm             - Mast top diameter (mm)
 * @param {number} params.snapshot.mastCw                - Mast drag coefficient
 * @param {number} params.snapshot.antennaForce          - Antenna wind force (N)
 * @param {number} params.snapshot.antennaMountHeight    - Antenna aerodynamic centroid height (m)
 * @param {Array}  params.levelResults          - Level results from calculateGuyWires
 *
 * @returns {{ levels: Array }} | null
 */
export function calculateGuyWireLoad({ snapshot, levelResults }) {
  if (!levelResults) return null

  const {
    q, mastHeight: H, diamBottomMm, diamTopMm, mastCw: cw,
    antennaForce, antennaMountHeight,
  } = snapshot
  const diamBottom = diamBottomMm / 1000
  const diamTop    = diamTopMm   / 1000
  const N = levelResults.length

  // Linear diameter at height z
  function diamAtZ(z) {
    return diamBottom + (diamTop - diamBottom) * z / H
  }

  // Wind force on mast section z_a..z_b (used for display as "Abschnittskraft")
  function sectionWindForce(z_a, z_b) {
    const area = (diamAtZ(z_a) + diamAtZ(z_b)) / 2 * (z_b - z_a)
    return q * cw * area
  }

  // Overturning moment about the base (z=0) of wind force on section z_a..z_b
  //   = q × cw × ∫[z_a..z_b] d(z) × z dz
  //   = q × cw × [ diamBottom×z²/2 + slope×z³/3 ] from z_a to z_b
  function sectionWindMoment(z_a, z_b) {
    const slope = (diamTop - diamBottom) / H
    const P = z => diamBottom * z * z / 2 + slope * z * z * z / 3
    return q * cw * (P(z_b) - P(z_a))
  }

  // Midpoint-rule section boundaries for level i
  function bounds(i) {
    const lower = i === 0     ? 0 : (levelResults[i - 1].height + levelResults[i].height) / 2
    const upper = i === N - 1 ? H : (levelResults[i].height     + levelResults[i + 1].height) / 2
    return { lower, upper }
  }

  const levels = levelResults.map((level, i) => {
    const { lower, upper } = bounds(i)

    const windForce  = sectionWindForce(lower, upper)    // displayed as Abschnittskraft
    const windMoment = sectionWindMoment(lower, upper)
    const antMoment  = i === N - 1 ? antennaForce * antennaMountHeight : 0
    const totalMoment = windMoment + antMoment

    // Horizontal restoring force needed at this attachment point
    const horizForce       = level.height > 0 ? totalMoment / level.height : 0
    const cosAlpha         = Math.cos(level.angleFromHorizontal * Math.PI / 180)
    const horizForcePerWire = level.wires > 0 ? horizForce / level.wires : 0
    const tension = level.wires > 0 && cosAlpha > 0
      ? horizForce / (level.wires * cosAlpha)
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
