import { useLanguage } from '../../hooks/useLanguage.jsx'

export default function SpiderBeamResults({
  results,
  mastConfig,
  desiredHeight,
  onHeightChange,
  onToggleLevel,
  onConfigureGuyWire,
}) {
  const { t } = useLanguage()
  const { activeSegments, inGroundtube, attachmentPoints } = results

  const selectedPoints = attachmentPoints.filter(p => p.active)

  function handleHeightInput(e) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) onHeightChange(Math.max(1, Math.min(mastConfig.segments, v)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mast label + height input */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-widest">{t('spiderBeamMastLabel')}:</span>
          <span className="text-slate-200 font-semibold text-sm">{mastConfig.name}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-slate-400">{t('spiderBeamHeight')}</label>
          <input
            type="number"
            min={1}
            max={mastConfig.segments}
            value={desiredHeight}
            onChange={handleHeightInput}
            className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-center
              text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-500">{t('spiderBeamHeightUnit')}</span>
        </div>

        <div className="text-xs text-green-400 bg-green-900/30 border border-green-800/50 rounded px-3 py-1.5 leading-relaxed">
          {activeSegments.length} {t('spiderBeamSegmentsActive')}
          {inGroundtube.length > 0 && (
            <> &nbsp;·&nbsp; Seg.&nbsp;{inGroundtube[0]}–{inGroundtube[inGroundtube.length - 1]}&nbsp;{t('spiderBeamInGroundtube')}</>
          )}
        </div>
      </div>

      {/* Attachment point toggles */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{t('spiderBeamGuyLevels')}</p>
        {attachmentPoints.map(({ segment, height, available, active }) => (
          <button
            key={segment}
            disabled={!available}
            onClick={() => available && onToggleLevel(segment)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left w-full transition-colors
              ${available
                ? active
                  ? 'bg-amber-900/30 border border-amber-700/50 hover:bg-amber-900/50'
                  : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                : 'opacity-40 bg-slate-800 border border-slate-700 cursor-not-allowed'
              }`}
          >
            <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center
              ${active ? 'bg-amber-500' : 'border-2 border-slate-500'}`}>
              {active && <span className="text-black text-xs font-bold leading-none">✓</span>}
            </div>
            <span className="text-sm font-medium text-slate-200 flex-1">
              {t('spiderBeamSegment')} {segment}
            </span>
            {available
              ? <span className="text-xs text-green-400 font-semibold">{height} m</span>
              : <span className="text-xs text-slate-500">{t('spiderBeamNotActive')}</span>
            }
          </button>
        ))}
      </div>

      {/* Transfer box */}
      <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-lg p-4 flex flex-col gap-3">
        <p className="text-xs text-indigo-400 uppercase tracking-widest">{t('spiderBeamTransferTitle')}</p>
        <p className="text-xs text-slate-400">{t('spiderBeamTransferPreview')}</p>

        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <span className="text-indigo-400">{t('spiderBeamHeight')}:</span>
          <span className="text-slate-200 font-semibold">{desiredHeight} m</span>
          {selectedPoints.map((p, i) => (
            <div key={p.segment} className="contents">
              <span className="text-indigo-400">Ebene {i + 1}:</span>
              <span className="text-slate-200">
                {p.height} m <span className="text-slate-500 text-xs">(Seg. {p.segment})</span>
              </span>
            </div>
          ))}
          {selectedPoints.length === 0 && (
            <span className="col-span-2 text-slate-500 text-xs">— keine Abspannpunkte ausgewählt</span>
          )}
        </div>

        <button
          disabled={selectedPoints.length === 0}
          onClick={() => onConfigureGuyWire({
            mastHeight: desiredHeight,
            levels: selectedPoints.map(p => ({ segment: p.segment, height: p.height })),
          })}
          className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed
            text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          {t('spiderBeamOpenGuyWire')}
        </button>
      </div>
    </div>
  )
}
