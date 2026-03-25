import { useState } from 'react'

/**
 * Tooltip — shows `content` in a floating panel on hover (desktop) or click (mobile).
 * Trigger: a small ℹ icon rendered inline next to the label.
 *
 * @param {React.ReactNode} content  — content to display inside the tooltip panel
 * @param {'left'|'right'} [align]  — horizontal alignment of the panel (default: 'left')
 */
export default function Tooltip({ content, align = 'left' }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-block leading-none">
      <button
        type="button"
        className="text-slate-500 hover:text-slate-300 focus:outline-none ml-1 align-middle"
        style={{ fontSize: '11px', lineHeight: 1 }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        aria-label="Info"
      >
        ℹ
      </button>

      {visible && (
        <div
          className={`absolute top-5 z-50 w-72 whitespace-normal text-left bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl text-xs text-slate-300 ${align === 'right' ? 'right-0' : 'left-0'}`}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          {content}
        </div>
      )}
    </span>
  )
}
