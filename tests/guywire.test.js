import { describe, it, expect } from 'vitest'
import { calculateGuyWires } from '../src/calculators/guywire/guywire.js'

describe('calculateGuyWires', () => {
  const baseConfig = {
    mastHeight: 12,
    levels: 2,
    levelConfig: [
      { height: 6, radius: 5, wires: 3 },
      { height: 11, radius: 8, wires: 3 },
    ],
  }

  it('calculates wire length using Pythagoras', () => {
    const result = calculateGuyWires(baseConfig)
    // Level 1: sqrt(6² + 5²) = sqrt(61) ≈ 7.810
    expect(result.levels[0].wireLength).toBeCloseTo(7.810, 2)
    // Level 2: sqrt(11² + 8²) = sqrt(185) ≈ 13.601
    expect(result.levels[1].wireLength).toBeCloseTo(13.601, 2)
  })

  it('calculates angle from horizontal', () => {
    const result = calculateGuyWires(baseConfig)
    // Level 1: arctan(6/5) ≈ 50.194°
    expect(result.levels[0].angleFromHorizontal).toBeCloseTo(50.194, 1)
    // Level 2: arctan(11/8) ≈ 53.974°
    expect(result.levels[1].angleFromHorizontal).toBeCloseTo(53.974, 1)
  })

  it('calculates angle from mast as 90 - angleFromHorizontal', () => {
    const result = calculateGuyWires(baseConfig)
    expect(result.levels[0].angleFromMast).toBeCloseTo(
      90 - result.levels[0].angleFromHorizontal, 5
    )
  })

  it('calculates total length per level', () => {
    const result = calculateGuyWires(baseConfig)
    // Level 1: 7.810 * 3 = 23.431
    expect(result.levels[0].totalLengthPerLevel).toBeCloseTo(23.431, 1)
  })

  it('calculates grand total across all levels', () => {
    const result = calculateGuyWires(baseConfig)
    const expected = result.levels.reduce((s, l) => s + l.totalLengthPerLevel, 0)
    expect(result.grandTotalLength).toBeCloseTo(expected, 5)
  })

  it('supports 4 wires per level independently', () => {
    const config = {
      mastHeight: 12,
      levels: 2,
      levelConfig: [
        { height: 6, radius: 5, wires: 4 },
        { height: 11, radius: 8, wires: 3 },
      ],
    }
    const result = calculateGuyWires(config)
    expect(result.levels[0].totalLengthPerLevel).toBeCloseTo(7.810 * 4, 1)
    expect(result.levels[1].totalLengthPerLevel).toBeCloseTo(13.601 * 3, 1)
  })

  it('supports 1, 2 and 3 levels', () => {
    const config1 = {
      mastHeight: 12,
      levels: 1,
      levelConfig: [{ height: 6, radius: 5, wires: 3 }],
    }
    expect(calculateGuyWires(config1).levels).toHaveLength(1)

    const config3 = {
      mastHeight: 18,
      levels: 3,
      levelConfig: [
        { height: 6, radius: 5, wires: 3 },
        { height: 12, radius: 8, wires: 3 },
        { height: 17, radius: 10, wires: 3 },
      ],
    }
    const result3 = calculateGuyWires(config3)
    expect(result3.levels).toHaveLength(3)
    expect(result3.grandTotalLength).toBeGreaterThan(0)
  })

  it('exposes height and radius in each level result', () => {
    const result = calculateGuyWires(baseConfig)
    expect(result.levels[0].height).toBe(6)
    expect(result.levels[0].radius).toBe(5)
    expect(result.levels[1].height).toBe(11)
    expect(result.levels[1].radius).toBe(8)
  })
})
