import { describe, it, expect } from 'vitest'
import { generateReport } from '../src/report/generateReport.js'

const windSnapshot = {
  q: 534, windSpeed: 22.5, mastHeight: 12,
  diamBottomMm: 100, diamTopMm: 60, mastCw: 1.1,
  antennaForce: 42, antennaMountHeight: 11,
  antennaArea: 0.5, antennaCw: 0.8,
  mastForce: 192, mastMoment: 1152,
  totalForce: 234, totalMoment: 1614,
}

const guyWireSnapshot = {
  mastHeight: 12,
  levels: [
    { height: 6, radius: 5, wires: 3, wireLength: 7.81, angleFromHorizontal: 50.2, angleFromMast: 39.8, totalLengthPerLevel: 23.43 },
    { height: 11, radius: 8, wires: 3, wireLength: 13.6, angleFromHorizontal: 53.97, angleFromMast: 36.03, totalLengthPerLevel: 40.8 },
  ],
  grandTotalLength: 64.23,
  loadResults: [
    { sectionForce: 98, horizForcePerWire: 32.7, tension: 51.4, tensionKgf: 5.24 },
    { sectionForce: 136, horizForcePerWire: 45.3, tension: 76.9, tensionKgf: 7.84 },
  ],
}

describe('generateReport', () => {
  it('returns a complete HTML document', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toMatch(/^<!DOCTYPE html>/)
    expect(html).toMatch(/<\/html>$/)
  })

  it('contains wind speed from snapshot', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('22.5')
  })

  it('contains total force from snapshot', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('234')
  })

  it('contains guy wire level height', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('6')
  })

  it('renders load table when loadResults is present', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('98') // sectionForce of level 1
  })

  it('omits load table when loadResults is null', () => {
    const snap = { ...guyWireSnapshot, loadResults: null }
    const html = generateReport({ windSnapshot, guyWireSnapshot: snap, lang: 'de' })
    // sectionForce values should not appear
    expect(html).not.toContain('>98<')
  })

  it('uses German labels for lang=de', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('Mast-Designer Bericht')
  })

  it('uses English labels for lang=en', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'en' })
    expect(html).toContain('Mast Designer Report')
  })

  it('includes print media query', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('@media print')
  })
})
