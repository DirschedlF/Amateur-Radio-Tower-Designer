import { describe, it, expect } from 'vitest'
import { calculateGuyWireLoad } from '../src/calculators/guywire/guywireload.js'

// Helper: build a levelResults entry as calculateGuyWires would produce it
function makeLevel(height, radius, wires) {
  const wireLength = Math.sqrt(height ** 2 + radius ** 2)
  const angleFromHorizontal = (Math.atan2(height, radius) * 180) / Math.PI
  return { height, radius, wireLength, angleFromHorizontal, wires }
}

// Helper: cylindrical mast snapshot (diamBottom = diamTop = d mm)
function flatSnapshot({ q = 1000, H = 10, dMm = 100, cw = 1.0, antennaForce = 0, antennaMountHeight = 0 } = {}) {
  return { q, windSpeed: 28, mastHeight: H, diamBottomMm: dMm, diamTopMm: dMm, mastCw: cw, antennaForce, antennaMountHeight }
}

// --- Section force helpers (for verification of unchanged display values) ---
// F_section = q × cw × d × (z_b - z_a)   for flat mast
// --- Moment helpers (core of new method) ---
// M_section(z_a, z_b) = q×cw × ∫[z_a..z_b] d(z)×z dz
// For flat mast: = q×cw×d × (z_b²−z_a²)/2
function flatMoment(snap, z_a, z_b) {
  const d = snap.diamBottomMm / 1000
  return snap.q * snap.mastCw * d * (z_b ** 2 - z_a ** 2) / 2
}

describe('calculateGuyWireLoad', () => {

  it('returns null when levelResults is null', () => {
    const snapshot = flatSnapshot()
    expect(calculateGuyWireLoad({ snapshot, levelResults: null })).toBeNull()
  })

  // ─── sectionForce is still the direct wind force on the section (display only) ───

  it('single level — sectionForce equals total mast wind force', () => {
    // flat mast H=10m, d=0.1m, q=1000, cw=1.0 → F_total = 1000 × 1.0 × 0.1 × 10 = 1000 N
    const snap = flatSnapshot({ H: 10 })
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults: [makeLevel(8, 6, 3)] })
    expect(result.levels[0].sectionForce).toBeCloseTo(1000, 3)
  })

  it('three levels — sectionForce uses midpoint boundaries', () => {
    // H=18m, levels at h=6,12,17 → midpoints: 9, 14.5
    // Section forces: 0..9 → 900 N, 9..14.5 → 550 N, 14.5..18 → 350 N
    const snap = flatSnapshot({ H: 18 })
    const levelResults = [makeLevel(6, 5, 3), makeLevel(12, 8, 3), makeLevel(17, 10, 3)]
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults })
    expect(result.levels[0].sectionForce).toBeCloseTo(900, 1)
    expect(result.levels[1].sectionForce).toBeCloseTo(550, 1)
    expect(result.levels[2].sectionForce).toBeCloseTo(350, 1)
  })

  // ─── NEW: moment-based tension ───

  it('single level — tension from overturning moment ÷ attachment height', () => {
    // H=10m, flat d=0.1m, q=1000, cw=1.0, no antenna
    // Section: 0..10  →  M = 1000 × 0.1 × (100−0)/2 = 5000 N·m
    // Level h=8, r=6, wires=3  →  horizForce = 5000/8 = 625 N
    // cos α = 6/10 = 0.6  →  tension = 625 / (3 × 0.6) = 347.22 N
    const snap = flatSnapshot({ H: 10 })
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults: [makeLevel(8, 6, 3)] })
    const M = flatMoment(snap, 0, 10)          // 5000 N·m
    const h = 8
    const cosAlpha = 6 / 10                    // 0.6
    const expectedTension = M / h / (3 * cosAlpha)
    expect(result.levels[0].horizForcePerWire).toBeCloseTo(M / h / 3, 1)
    expect(result.levels[0].tension).toBeCloseTo(expectedTension, 1)     // ≈ 347.2 N
    expect(result.levels[0].tensionKgf).toBeCloseTo(expectedTension / 9.81, 2)
  })

  it('higher attachment height gives lower wire tension (more leverage)', () => {
    // Raising the single attachment point from h=4m to h=8m (same mast, same r=6m)
    // should REDUCE the required tension (more lever arm against overturning)
    const snap = flatSnapshot({ H: 10 })
    const low  = calculateGuyWireLoad({ snapshot: snap, levelResults: [makeLevel(4, 6, 3)] })
    const high = calculateGuyWireLoad({ snapshot: snap, levelResults: [makeLevel(8, 6, 3)] })
    expect(high.levels[0].tension).toBeLessThan(low.levels[0].tension)
  })

  it('two levels — tension derived from each section overturning moment', () => {
    // H=12m, flat d=0.1m, q=1000, cw=1.0
    // Level 1: h=6, r=5, wires=3  |  Level 2: h=11, r=8, wires=3
    // Midpoint boundary: (6+11)/2 = 8.5m
    // M₁(0..8.5)  = 1000×0.1×(72.25−0)/2  = 3612.5 N·m  →  R₁ = 3612.5/6  ≈ 602.1 N
    // M₂(8.5..12) = 1000×0.1×(144−72.25)/2 = 3587.5 N·m  +  antennaForce×h_ant = 100×11 = 1100
    //             →  totalMoment₂ = 4687.5  →  R₂ = 4687.5/11 ≈ 426.1 N
    const snap = flatSnapshot({ H: 12, antennaForce: 100, antennaMountHeight: 11 })
    const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults })

    const M1 = flatMoment(snap, 0, 8.5)                             // 3612.5
    const M2 = flatMoment(snap, 8.5, 12)                            // 3587.5
    const R1 = M1 / 6
    const R2 = (M2 + 100 * 11) / 11

    const cosAlpha1 = 5 / Math.sqrt(61)
    const cosAlpha2 = 8 / Math.sqrt(185)

    expect(result.levels[0].sectionForce).toBeCloseTo(850, 1)
    expect(result.levels[1].sectionForce).toBeCloseTo(350, 1)
    expect(result.levels[0].horizForcePerWire).toBeCloseTo(R1 / 3, 1)
    expect(result.levels[1].horizForcePerWire).toBeCloseTo(R2 / 3, 1)
    expect(result.levels[0].tension).toBeCloseTo(R1 / (3 * cosAlpha1), 1)
    expect(result.levels[1].tension).toBeCloseTo(R2 / (3 * cosAlpha2), 1)
  })

  it('antenna moment uses actual mount height — low antenna gives less top-level force than high antenna', () => {
    // Same mast, same antenna force, different mount heights → different top-level tension
    const base = { H: 12, antennaForce: 500 }
    const snapLow  = flatSnapshot({ ...base, antennaMountHeight: 3  })
    const snapHigh = flatSnapshot({ ...base, antennaMountHeight: 11 })
    const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]

    const resLow  = calculateGuyWireLoad({ snapshot: snapLow,  levelResults })
    const resHigh = calculateGuyWireLoad({ snapshot: snapHigh, levelResults })

    // High mount creates more overturning moment → higher top-level tension
    expect(resHigh.levels[1].tension).toBeGreaterThan(resLow.levels[1].tension)
    // Bottom level unaffected by antenna
    expect(resLow.levels[0].tension).toBeCloseTo(resHigh.levels[0].tension, 3)
  })

  it('zero wires guard — returns 0 tension without throwing', () => {
    const snap = flatSnapshot()
    const levelResults = [makeLevel(8, 6, 0)]
    expect(() => calculateGuyWireLoad({ snapshot: snap, levelResults })).not.toThrow()
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults })
    expect(result.levels[0].tension).toBe(0)
    expect(result.levels[0].horizForcePerWire).toBe(0)
  })

  it('tensionKgf = tension / 9.81', () => {
    const snap = flatSnapshot()
    const result = calculateGuyWireLoad({ snapshot: snap, levelResults: [makeLevel(8, 6, 3)] })
    expect(result.levels[0].tensionKgf).toBeCloseTo(result.levels[0].tension / 9.81, 5)
  })

})
