/**
 * calculateSpiderBeam — pure logic for Spiderbeam telescoping mast configuration.
 *
 * Segment numbering: 1 = Grundrohr (base tube, always present at 0–1 m).
 * Segments 2–14 are the sliding sections, pulled out from the top (seg 14 first).
 *
 * For desired height H (1–14):
 *   Active segments (pulled out): N ∈ [2..14] where N ≥ (segments + 2 − H)
 *   In groundtube:                N ∈ [2..segments + 1 − H]
 *   Attachment point height for segment N: H + N − (segments + 1)
 *   Segment N is available when: H ≥ segments + 2 − N
 */

export const MAST_CONFIGS = {
  '14m_hd': {
    name: 'Spiderbeam 14m HD',
    segments: 14,
    segmentLength: 1.0,        // meters per segment
    guyLevels: [10, 12, 14],   // segment numbers of attachment points (ascending)
  },
  // '12m_hd': { … }  — future extension, not in scope
}

/**
 * @param {object}   params
 * @param {object}   params.mastConfig       - Entry from MAST_CONFIGS
 * @param {number}   params.desiredHeight    - 1–mastConfig.segments
 * @param {number[]} params.activeGuyLevels  - Segment numbers the user has toggled on
 * @returns {{
 *   activeSegments: number[],
 *   inGroundtube: number[],
 *   attachmentPoints: Array<{segment:number, height:number|null, available:boolean, active:boolean}>
 * }}
 */
export function calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }) {
  const H = Math.max(1, Math.min(mastConfig.segments, Math.round(desiredHeight)))
  const { segments, guyLevels } = mastConfig

  // firstActive: lowest segment number that is pulled out
  // For 14-segment mast: firstActive = 16 - H (generalised: segments + 2 - H)
  const firstActive = segments + 2 - H

  const activeSegments = []
  const inGroundtube = []
  for (let n = 2; n <= segments; n++) {
    if (n >= firstActive) activeSegments.push(n)
    else inGroundtube.push(n)
  }

  const attachmentPoints = guyLevels.map(n => {
    const available = n >= firstActive
    // height formula: H + N - (segments + 1), e.g. H + N - 15 for 14-segment mast
    const height = available ? H + n - (segments + 1) : null
    return {
      segment: n,
      height,
      available,
      active: available && activeGuyLevels.includes(n),
    }
  })

  return { activeSegments, inGroundtube, attachmentPoints }
}
