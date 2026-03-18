import { describe, it, expect } from 'vitest'
import { calculateWindLoad } from '../src/calculators/windload/windload.js'

const baseConfig = {
  windSpeed: 20,
  mast: { height: 10, diamBottom: 0.1, diamTop: 0.06, cw: 0.8 },
  antenna: { area: 0.5, cw: 0.8, mountHeight: 9 },
}

describe('calculateWindLoad', () => {
  it('calculates dynamic pressure from wind speed', () => {
    // q = 0.5 * 1.25 * 20² = 250 N/m²
    const result = calculateWindLoad(baseConfig)
    expect(result.q).toBeCloseTo(250, 1)
  })

  it('calculates mast projected area as trapezoid', () => {
    // A = (0.1 + 0.06) / 2 * 10 = 0.8 m²
    const result = calculateWindLoad(baseConfig)
    expect(result.mast.area).toBeCloseTo(0.8, 5)
  })

  it('calculates mast wind force', () => {
    // F = 250 * 0.8 * 0.8 = 160 N
    const result = calculateWindLoad(baseConfig)
    expect(result.mast.force).toBeCloseTo(160, 1)
  })

  it('calculates centroid moment arm for conical mast', () => {
    // h = 10/3 * (0.1 + 2*0.06) / (0.1 + 0.06) = 10/3 * 0.22/0.16 ≈ 4.583 m
    const result = calculateWindLoad(baseConfig)
    expect(result.mast.momentArm).toBeCloseTo(4.583, 2)
  })

  it('centroid of cylinder (diamBottom === diamTop) is H/2', () => {
    const config = { ...baseConfig, mast: { height: 10, diamBottom: 0.1, diamTop: 0.1, cw: 0.8 } }
    const result = calculateWindLoad(config)
    expect(result.mast.momentArm).toBeCloseTo(5.0, 5)
  })

  it('centroid of cone (diamTop === 0) is H/3', () => {
    const config = { ...baseConfig, mast: { height: 10, diamBottom: 0.1, diamTop: 0, cw: 0.8 } }
    const result = calculateWindLoad(config)
    expect(result.mast.momentArm).toBeCloseTo(10 / 3, 5)
  })

  it('guard: both diameters zero returns momentArm 0 without NaN', () => {
    const config = { ...baseConfig, mast: { height: 10, diamBottom: 0, diamTop: 0, cw: 0.8 } }
    const result = calculateWindLoad(config)
    expect(result.mast.momentArm).toBe(0)
    expect(result.mast.moment).toBe(0)
    expect(Number.isNaN(result.total.moment)).toBe(false)
  })

  it('calculates antenna wind force', () => {
    // F = 250 * 0.5 * 0.8 = 100 N
    const result = calculateWindLoad(baseConfig)
    expect(result.antenna.force).toBeCloseTo(100, 1)
  })

  it('calculates mast bending moment', () => {
    const result = calculateWindLoad(baseConfig)
    expect(result.mast.moment).toBeCloseTo(160 * result.mast.momentArm, 2)
  })

  it('calculates antenna bending moment', () => {
    // M = 100 * 9 = 900 Nm
    const result = calculateWindLoad(baseConfig)
    expect(result.antenna.moment).toBeCloseTo(900, 1)
  })

  it('calculates total force and moment', () => {
    const result = calculateWindLoad(baseConfig)
    expect(result.total.force).toBeCloseTo(result.mast.force + result.antenna.force, 5)
    expect(result.total.moment).toBeCloseTo(result.mast.moment + result.antenna.moment, 5)
  })
})
