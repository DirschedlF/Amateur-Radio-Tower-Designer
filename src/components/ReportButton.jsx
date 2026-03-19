import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { generateReport } from '../report/generateReport.js'

export default function ReportButton({ windSnapshot, guyWireSnapshot, onCloseDrawer = () => {} }) {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const popoverRef = useRef(null)

  const disabled = !windSnapshot || !guyWireSnapshot

  function handleOpen() {
    onCloseDrawer()
    const rect = btnRef.current.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    setPos({ top: rect.bottom + 6, right: Math.max(right, 4) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    function onMouse(e) {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
          popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [open])

  function handlePrint() {
    setOpen(false)
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
    const w = window.open('', '_blank')
    if (!w) { alert(t('reportPopupBlocked')); return }
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 250)
  }

  function handleDownload() {
    setOpen(false)
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mast-bericht-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={disabled ? undefined : handleOpen}
        disabled={disabled}
        title={disabled ? t('reportBothRequired') : undefined}
        className={`text-sm px-3 py-1 rounded-full transition-colors ${
          disabled
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }`}
      >
        {t('reportButton')}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 50,
            width: 'min(220px, 90vw)',
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
        >
          <button
            onClick={handlePrint}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
          >
            🖨️ {t('reportPrint')}
          </button>
          <button
            onClick={handleDownload}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors border-t border-slate-700"
          >
            ⬇️ {t('reportDownload')}
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
