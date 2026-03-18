import { describe, it, expect } from 'vitest'
import { calculateGuyWireLoad } from '../src/calculators/guywire/guywireload.js'

// Helper: build a levelResults entry as calculateGuyWires would produce it
function makeLevel(height, radius, wires) {
  const wireLength = Math.sqrt(height ** 2 + radius ** 2)
  const angleFromHorizontal = (Math.atan2(height, radius) * 180) / Math.PI
  return { height, radius, wireLength, angleFromHorizontal, wires }
}

describe('calculateGuyWireLoad', () => {

  it('returns null when levelResults is null', () => {
    const snapshot = {
      q: 500, windSpeed: 28,
      mastHeight: 10, diamBottomMm: 100, diamTopMm: 60, mastCw: 1.1,
      antennaForce: 0, antennaMountHeight: 9,
    }
    expect(calculateGuyWireLoad({ snapshot, levelResults: null })).toBeNull()
  })

  it('single level — assigns full mast + antenna to level 1', () => {
    // Flat mast (dBot = dTop = 100mm) for easy area calculation
    // H=10m, d=0.1m, cw=1.0, q=1000 N/m²
    // Area = 0.1 × 10 = 1.0 m², F_wind = 1000 N
    // Level: height=8m, radius=6m → wireLength=10m, angleFromHorizontal=53.13°
    // cos(53.13°) = 6/10 = 0.6
    // antennaForce = 200 N → F_total = 1200 N
    // tension = 1200 / (3 × 0.6) = 666.67 N
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 200, antennaMountHeight: 9,
    }
    const levelResults = [makeLevel(8, 6, 3)]
    const result = calculateGuyWireLoad({ snapshot, levelResults })

    expect(result).not.toBeNull()
    expect(result.levels).toHaveLength(1)
    expect(result.levels[0].sectionForce).toBeCloseTo(1000, 1)
    expect(result.levels[0].horizForcePerWire).toBeCloseTo(400, 1) // (1000+200)/3
    expect(result.levels[0].tension).toBeCloseTo(666.67, 1)
    expect(result.levels[0].tensionKgf).toBeCloseTo(666.67 / 9.81, 2)
  })

  it('flat mast section area equals rectangle', () => {
    // diamBottom = diamTop = 0.1m → section area = d × length (rectangle)
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 0, antennaMountHeight: 9,
    }
    const levelResults = [makeLevel(8, 6, 3)]
    const result = calculateGuyWireLoad({ snapshot, levelResults })
    // F = 1000 × 1.0 × (0.1 × 10) = 1000 N
    expect(result.levels[0].sectionForce).toBeCloseTo(1000, 3)
  })

  it('two levels — correct midpoint split, antenna on top level only', () => {
    // H=12m, flat mast d=0.1m, cw=1.0, q=1000
    // Level 1: h=6m, r=5m, wires=3 → section 0..8.5m → area=0.1×8.5=0.85 → F1=850
    // Level 2: h=11m, r=8m, wires=3 → section 8.5..12m → area=0.1×3.5=0.35 → F2_wind=350
    // antennaForce=100 → F2=450
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 12, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 100, antennaMountHeight: 11,
    }
    const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]
    const result = calculateGuyWireLoad({ snapshot, levelResults })

    expect(result.levels).toHaveLength(2)
    expect(result.levels[0].sectionForce).toBeCloseTo(850, 1)
    expect(result.levels[1].sectionForce).toBeCloseTo(350, 1)  // wind only, before antenna
    // antenna added to top level tension
    const cosAlpha2 = 8 / Math.sqrt(185)
    expect(result.levels[1].tension).toBeCloseTo(450 / (3 * cosAlpha2), 1)
    // level 1 gets no antenna
    const cosAlpha1 = 5 / Math.sqrt(61)
    expect(result.levels[0].tension).toBeCloseTo(850 / (3 * cosAlpha1), 1)
  })

  it('three levels — correct three-way split', () => {
    // H=18m, flat d=0.1m, cw=1.0, q=1000, antennaForce=0
    // Levels: h=6,12,17 → midpoints: 9, 14.5
    // Section 1: 0..9m → area=0.9m² → F=900N
    // Section 2: 9..14.5m → area=0.55m² → F=550N
    // Section 3: 14.5..18m → area=0.35m² → F=350N
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 18, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 0, antennaMountHeight: 17,
    }
    const levelResults = [
      makeLevel(6, 5, 3),
      makeLevel(12, 8, 3),
      makeLevel(17, 10, 3),
    ]
    const result = calculateGuyWireLoad({ snapshot, levelResults })

    expect(result.levels).toHaveLength(3)
    expect(result.levels[0].sectionForce).toBeCloseTo(900, 1)
    expect(result.levels[1].sectionForce).toBeCloseTo(550, 1)
    expect(result.levels[2].sectionForce).toBeCloseTo(350, 1)
  })

  it('antenna always goes to top level regardless of antennaMountHeight', () => {
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 12, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 500, antennaMountHeight: 3, // below both levels — still goes to top
    }
    const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]
    const result = calculateGuyWireLoad({ snapshot, levelResults })
    // Top level (index 1) tension should include antennaForce=500 in numerator
    const cosAlpha2 = 8 / Math.sqrt(185)
    const F2 = 350 + 500  // sectionForce + antenna
    expect(result.levels[1].tension).toBeCloseTo(F2 / (3 * cosAlpha2), 1)
    // Bottom level should NOT include antenna
    const cosAlpha1 = 5 / Math.sqrt(61)
    expect(result.levels[0].tension).toBeCloseTo(850 / (3 * cosAlpha1), 1)
  })

  it('zero wires guard — returns 0 tension without throwing', () => {
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 0, antennaMountHeight: 9,
    }
    const levelResults = [makeLevel(8, 6, 0)]  // wires=0
    expect(() => calculateGuyWireLoad({ snapshot, levelResults })).not.toThrow()
    const result = calculateGuyWireLoad({ snapshot, levelResults })
    expect(result.levels[0].tension).toBe(0)
    expect(result.levels[0].horizForcePerWire).toBe(0)
  })

  it('tensionKgf = tension / 9.81', () => {
    const snapshot = {
      q: 1000, windSpeed: 28,
      mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
      antennaForce: 0, antennaMountHeight: 9,
    }
    const levelResults = [makeLevel(8, 6, 3)]
    const result = calculateGuyWireLoad({ snapshot, levelResults })
    expect(result.levels[0].tensionKgf).toBeCloseTo(result.levels[0].tension / 9.81, 5)
  })

})
