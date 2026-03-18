/**
 * calculateGuyWires — pure geometric calculation, no React.
 *
 * @param {object} config
 * @param {number} config.mastHeight   - Total mast height in meters
 * @param {number} config.levels       - Number of guy wire levels (2, 3 or 4)
 * @param {Array}  config.levelConfig  - Per-level settings
 * @param {number} config.levelConfig[].height  - Height of attachment point (m)
 * @param {number} config.levelConfig[].radius  - Horizontal anchor distance (m)
 * @param {number} config.levelConfig[].wires   - Number of wires at this level (3 or 4)
 *
 * @returns {{ levels: Array, grandTotalLength: number }}
 */
export function calculateGuyWires({ levels, levelConfig }) {
  const levelResults = levelConfig.slice(0, levels).map(({ height, radius, wires }) => {
    const wireLength = Math.sqrt(height ** 2 + radius ** 2)
    const angleFromHorizontal = (Math.atan2(height, radius) * 180) / Math.PI
    const angleFromMast = 90 - angleFromHorizontal
    const totalLengthPerLevel = wireLength * wires

    return {
      wireLength,
      angleFromHorizontal,
      angleFromMast,
      totalLengthPerLevel,
      wires,
    }
  })

  const grandTotalLength = levelResults.reduce(
    (sum, l) => sum + l.totalLengthPerLevel,
    0
  )

  return { levels: levelResults, grandTotalLength }
}
