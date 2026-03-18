/**
 * calculateWindLoad — pure wind load calculation, no React.
 *
 * @param {object} config
 * @param {number} config.windSpeed       - Wind velocity (m/s)
 * @param {number} [config.gustFactor=1]  - Gust factor applied to dynamic pressure (default: 1 = no gust)
 * @param {object} config.mast
 * @param {number} config.mast.height     - Mast height (m)
 * @param {number} config.mast.diamBottom - Diameter at base (m)
 * @param {number} config.mast.diamTop    - Diameter at top (m)
 * @param {number} config.mast.cw         - Drag coefficient
 * @param {object} config.antenna
 * @param {number} config.antenna.area        - Projected wind area (m²)
 * @param {number} config.antenna.cw          - Drag coefficient
 * @param {number} config.antenna.mountHeight - Aerodynamic center height (m)
 *
 * @returns {{ q, mast: { area, force, momentArm, moment }, antenna: { force, moment }, total: { force, moment } }}
 */
export function calculateWindLoad({ windSpeed, gustFactor = 1, mast, antenna }) {
  const q = 0.5 * 1.25 * windSpeed ** 2 * gustFactor

  const area = ((mast.diamBottom + mast.diamTop) / 2) * mast.height
  const mastForce = q * area * mast.cw

  const diamSum = mast.diamBottom + mast.diamTop
  const momentArm = diamSum === 0
    ? 0
    : (mast.height / 3) * (mast.diamBottom + 2 * mast.diamTop) / diamSum
  const mastMoment = mastForce * momentArm

  const antennaForce = q * antenna.area * antenna.cw
  const antennaMoment = antennaForce * antenna.mountHeight

  return {
    q,
    mast: { area, force: mastForce, momentArm, moment: mastMoment },
    antenna: { force: antennaForce, moment: antennaMoment },
    total: { force: mastForce + antennaForce, moment: mastMoment + antennaMoment },
  }
}
