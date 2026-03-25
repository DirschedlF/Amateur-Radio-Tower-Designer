import { describe, it, expect } from 'vitest'
import { MAST_CONFIGS, calculateSpiderBeam } from '../src/calculators/spiderbeam/spiderbeam.js'

const cfg = MAST_CONFIGS['14m_hd']

describe('calculateSpiderBeam — H=14 (full height)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 14, activeGuyLevels: [10, 12, 14] })

  it('no segments in groundtube', () => expect(r.inGroundtube).toEqual([]))
  it('segments 2–14 active', () => expect(r.activeSegments).toEqual([2,3,4,5,6,7,8,9,10,11,12,13,14]))
  it('attachment points at 9, 11, 13 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([9, 11, 13]))
  it('all available', () => expect(r.attachmentPoints.every(p => p.available)).toBe(true))
  it('all active', () => expect(r.attachmentPoints.every(p => p.active)).toBe(true))
})

describe('calculateSpiderBeam — H=12', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 12, activeGuyLevels: [10, 12, 14] })

  it('segments 2+3 in groundtube', () => expect(r.inGroundtube).toEqual([2, 3]))
  it('segments 4–14 active', () => expect(r.activeSegments).toEqual([4,5,6,7,8,9,10,11,12,13,14]))
  it('attachment points at 7, 9, 11 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([7, 9, 11]))
})

describe('calculateSpiderBeam — H=10', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 10, activeGuyLevels: [10, 12, 14] })
  it('attachment points at 5, 7, 9 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([5, 7, 9]))
})

describe('calculateSpiderBeam — H=6 boundary (seg 10 just available)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 6, activeGuyLevels: [10, 12, 14] })
  it('seg 10 available at H=6', () => {
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(true)
    expect(p.height).toBe(1)
  })
})

describe('calculateSpiderBeam — H=5 boundary (seg 10 unavailable)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 5, activeGuyLevels: [10, 12, 14] })
  it('seg 10 not available', () => {
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(false)
    expect(p.active).toBe(false)
  })
})

describe('calculateSpiderBeam — H=4 (seg 12 available, seg 10 not)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 4, activeGuyLevels: [10, 12, 14] })
  it('seg 12 available', () => expect(r.attachmentPoints.find(p => p.segment === 12).available).toBe(true))
  it('seg 10 not available', () => expect(r.attachmentPoints.find(p => p.segment === 10).available).toBe(false))
})

describe('calculateSpiderBeam — H=1 (only groundtube)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 1, activeGuyLevels: [10, 12, 14] })
  it('no active segments', () => expect(r.activeSegments).toEqual([]))
  it('no attachment points available', () => expect(r.attachmentPoints.every(p => !p.available)).toBe(true))
})

describe('calculateSpiderBeam — toggle: deselected level is available but not active', () => {
  it('seg 14 available but not active when omitted', () => {
    const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 14, activeGuyLevels: [10, 12] })
    const p14 = r.attachmentPoints.find(p => p.segment === 14)
    expect(p14.available).toBe(true)
    expect(p14.active).toBe(false)
  })
})
