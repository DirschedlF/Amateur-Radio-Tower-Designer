# Guy Wire Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (DE/EN) React web app with a sidebar-based multi-tool framework, starting with a geometric guy wire calculator for amateur radio masts.

**Architecture:** Single-page React app with a persistent sidebar for calculator navigation. The active calculator owns its own input state and passes a derived config to a pure calculation function; results flow down to a diagram and table. The i18n system is a lightweight React context — no external library.

**Tech Stack:** React 18, Vite, Tailwind CSS 3, Lucide React, Vitest (unit tests), vite-plugin-singlefile + cross-env (dual-build), ESLint strict.

---

## File Map

| File | Role |
|---|---|
| `package.json` | Dependencies + npm scripts |
| `vite.config.js` | Vite config with dual-build (standard / singlefile) |
| `tailwind.config.js` | Tailwind config |
| `postcss.config.js` | PostCSS config |
| `eslint.config.js` | ESLint 9 flat config (React + strict) |
| `index.html` | HTML entry point |
| `src/main.jsx` | React DOM mount + LanguageProvider |
| `src/App.jsx` | Sidebar + active calculator routing |
| `src/index.css` | Tailwind base imports |
| `src/i18n/translations.js` | All DE/EN strings |
| `src/hooks/useLanguage.js` | Language context: `{ lang, t, toggleLang }` |
| `src/components/Sidebar.jsx` | Left nav, calculator list, active highlight |
| `src/calculators/guywire/guywire.js` | Pure calculation logic — no React |
| `src/calculators/guywire/GuyWireCalc.jsx` | Orchestrator: holds state, passes to children |
| `src/calculators/guywire/GuyWireInputs.jsx` | Input form (global + per-level) |
| `src/calculators/guywire/GuyWireDiagram.jsx` | SVG side view |
| `src/calculators/guywire/GuyWireResults.jsx` | Results table |
| `tests/guywire.test.js` | Vitest unit tests for guywire.js |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `eslint.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "amateur-radio-tower-designer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:standalone": "cross-env BUILD_MODE=singlefile vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^7.0.0",
    "vite-plugin-singlefile": "^2.0.0",
    "cross-env": "^7.0.3",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@eslint/js": "^9.0.0",
    "globals": "^15.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react": "^7.37.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd "D:/!GitHub/Amateur Radio Tower Designer"
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.BUILD_MODE === 'singlefile'

export default defineConfig({
  plugins: [
    react(),
    ...(isSingleFile ? [viteSingleFile()] : []),
  ],
  base: isSingleFile ? './' : '/',
  build: {
    outDir: isSingleFile ? 'dist-standalone' : 'dist',
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 5: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create `eslint.config.js`** (ESLint 9 flat config format)

```js
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '18.2' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
]
```

(Both `@eslint/js` and `globals` are already in `package.json` from Step 1 — no additional edit needed.)

- [ ] **Step 7: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Amateur Radio Tower Designer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 9: Create `.gitignore`**

```
node_modules/
dist/
dist-standalone/
.superpowers/
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows blank page (no components yet). Stop with Ctrl+C.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.js tailwind.config.js postcss.config.js eslint.config.js index.html src/index.css .gitignore package-lock.json
git commit -m "feat: project scaffold — React/Vite/Tailwind setup"
```

---

## Task 2: i18n System

**Files:**
- Create: `src/i18n/translations.js`
- Create: `src/hooks/useLanguage.js`

- [ ] **Step 1: Create `src/i18n/translations.js`**

```js
export const translations = {
  de: {
    appTitle: 'Amateurfunk Mast-Designer',
    sidebarCalculators: 'Rechner',
    sidebarComingSoon: 'Demnächst',
    calcGuyWire: 'Abspannung',
    calcGuyWireSubtitle: 'Geometrie',
    calcWindLoad: 'Windlast',
    calcGrounding: 'Erdung',
    langToggle: 'EN',

    // Inputs
    mastHeight: 'Masthöhe',
    mastHeightUnit: 'm',
    levels: 'Abspannebenen',
    wires: 'Drähte',
    levelLabel: 'Ebene',
    heightLabel: 'Höhe (m)',
    radiusLabel: 'Radius (m)',
    wiresLabel: 'Drähte',

    // Results
    resultsTitle: 'Ergebnisse',
    colLevel: 'Ebene',
    colWireLength: 'Drahtlänge',
    colAngleH: 'Winkel (Horiz.)',
    colAngleM: 'Winkel (Mast)',
    colTotalLevel: 'Gesamt Ebene',
    grandTotal: 'Gesamtlänge',
    perWire: 'je Draht',
    unit_m: 'm',
    unit_deg: '°',

    // Diagram
    diagramTitle: 'Seitenansicht',
    ground: 'Boden',
  },
  en: {
    appTitle: 'Amateur Radio Tower Designer',
    sidebarCalculators: 'Calculators',
    sidebarComingSoon: 'Coming Soon',
    calcGuyWire: 'Guy Wires',
    calcGuyWireSubtitle: 'Geometry',
    calcWindLoad: 'Wind Load',
    calcGrounding: 'Grounding',
    langToggle: 'DE',

    // Inputs
    mastHeight: 'Mast Height',
    mastHeightUnit: 'm',
    levels: 'Guy Wire Levels',
    wires: 'Wires',
    levelLabel: 'Level',
    heightLabel: 'Height (m)',
    radiusLabel: 'Radius (m)',
    wiresLabel: 'Wires',

    // Results
    resultsTitle: 'Results',
    colLevel: 'Level',
    colWireLength: 'Wire Length',
    colAngleH: 'Angle (Horiz.)',
    colAngleM: 'Angle (Mast)',
    colTotalLevel: 'Level Total',
    grandTotal: 'Grand Total',
    perWire: 'per wire',
    unit_m: 'm',
    unit_deg: '°',

    // Diagram
    diagramTitle: 'Side View',
    ground: 'Ground',
  },
}
```

- [ ] **Step 2: Create `src/hooks/useLanguage.js`**

```js
import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('lang') || 'de'
  )

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'de' ? 'en' : 'de'
      localStorage.setItem('lang', next)
      return next
    })
  }, [])

  const t = useCallback(
    (key) => translations[lang][key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.js src/hooks/useLanguage.js
git commit -m "feat: i18n system — DE/EN translations + useLanguage hook"
```

---

## Task 3: Calculation Logic (TDD)

**Files:**
- Create: `src/calculators/guywire/guywire.js`
- Create: `tests/guywire.test.js`

- [ ] **Step 1: Create the failing test file `tests/guywire.test.js`**

```js
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

  it('supports 3 and 4 levels', () => {
    const config3 = {
      mastHeight: 18,
      levels: 3,
      levelConfig: [
        { height: 6, radius: 5, wires: 3 },
        { height: 12, radius: 8, wires: 3 },
        { height: 17, radius: 10, wires: 3 },
      ],
    }
    const result = calculateGuyWires(config3)
    expect(result.levels).toHaveLength(3)
    expect(result.grandTotalLength).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/calculators/guywire/guywire.js'`

- [ ] **Step 3: Create `src/calculators/guywire/guywire.js`**

```js
/**
 * calculateGuyWires — pure geometric calculation, no React.
 *
 * @param {object} config
 * @param {number} config.mastHeight   - Total mast height in meters
 * @param {number} config.levels       - Number of guy wire levels (2, 3 or 4)
 * @param {Array}  config.levelConfig  - Per-level settings
 * @param {number} config.levelConfig[].height  - Height of attachment point (m)
 * @param {number} config.levelConfig[].radius  - Horizontal anchor distance (m)
 * @param {number} config.levelConfig[].wires   - Number of wires at this level (3 or 4)
 *
 * @returns {{ levels: Array, grandTotalLength: number }}
 */
export function calculateGuyWires({ mastHeight, levels, levelConfig }) {
  const levelResults = levelConfig.slice(0, levels).map(({ height, radius, wires }) => {
    const wireLength = Math.sqrt(height ** 2 + radius ** 2)
    const angleFromHorizontal = (Math.atan2(height, radius) * 180) / Math.PI
    const angleFromMast = 90 - angleFromHorizontal
    const totalLengthPerLevel = wireLength * wires

    return {
      wireLength,
      angleFromHorizontal,
      angleFromMast,
      totalLengthPerLevel,
      wires,
    }
  })

  const grandTotalLength = levelResults.reduce(
    (sum, l) => sum + l.totalLengthPerLevel,
    0
  )

  return { levels: levelResults, grandTotalLength }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/calculators/guywire/guywire.js tests/guywire.test.js
git commit -m "feat: guy wire calculation logic with Vitest unit tests"
```

---

## Task 4: App Shell

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/components/Sidebar.jsx`

- [ ] **Step 1: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './hooks/useLanguage.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
)
```

- [ ] **Step 2: Create `src/components/Sidebar.jsx`**

```jsx
import { useLanguage } from '../hooks/useLanguage.js'

const CALCULATORS = [
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
]

const COMING_SOON = [
  { id: 'windload', labelKey: 'calcWindLoad' },
  { id: 'grounding', labelKey: 'calcGrounding' },
]

export default function Sidebar({ activeCalc, onSelect }) {
  const { t } = useLanguage()

  return (
    <aside className="w-44 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col py-3">
      <p className="px-3 mb-2 text-xs uppercase tracking-widest text-slate-500">
        {t('sidebarCalculators')}
      </p>

      {CALCULATORS.map(calc => (
        <button
          key={calc.id}
          onClick={() => onSelect(calc.id)}
          className={`mx-2 mb-1 rounded-md px-3 py-2 text-left transition-colors ${
            activeCalc === calc.id
              ? 'bg-blue-700 text-white'
              : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          <div className="text-sm font-medium">{t(calc.labelKey)}</div>
          {calc.subtitleKey && (
            <div className={`text-xs ${activeCalc === calc.id ? 'text-blue-200' : 'text-slate-500'}`}>
              {t(calc.subtitleKey)}
            </div>
          )}
        </button>
      ))}

      <p className="px-3 mt-4 mb-2 text-xs uppercase tracking-widest text-slate-500">
        {t('sidebarComingSoon')}
      </p>

      {COMING_SOON.map(calc => (
        <div
          key={calc.id}
          className="mx-2 mb-1 rounded-md px-3 py-2 opacity-35 cursor-default"
        >
          <div className="text-sm text-slate-400">{t(calc.labelKey)}</div>
        </div>
      ))}
    </aside>
  )
}
```

- [ ] **Step 3: Create `src/App.jsx`**

```jsx
import { useState } from 'react'
import { useLanguage } from './hooks/useLanguage.js'
import Sidebar from './components/Sidebar.jsx'
import GuyWireCalc from './calculators/guywire/GuyWireCalc.jsx'

const CALC_COMPONENTS = {
  guywire: GuyWireCalc,
}

export default function App() {
  const [activeCalc, setActiveCalc] = useState('guywire')
  const { t, toggleLang } = useLanguage()

  const ActiveCalc = CALC_COMPONENTS[activeCalc]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-xl">📡</span>
          <span className="font-semibold text-slate-100">{t('appTitle')}</span>
        </div>
        <button
          onClick={toggleLang}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
        >
          {t('langToggle')}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCalc={activeCalc} onSelect={setActiveCalc} />
        <main className="flex-1 overflow-auto p-4">
          {ActiveCalc && <ActiveCalc />}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify dev server shows the shell**

```bash
npm run dev
```

Expected: App renders with header (📡 title, language toggle), sidebar (Abspannung active, Windlast/Erdung dimmed), and an empty main area (GuyWireCalc doesn't exist yet — create a placeholder if Vite errors).

Temporary placeholder to unblock — create `src/calculators/guywire/GuyWireCalc.jsx`:
```jsx
export default function GuyWireCalc() { return <div className="text-slate-400">Loading…</div> }
```

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/main.jsx src/App.jsx src/components/Sidebar.jsx src/calculators/guywire/GuyWireCalc.jsx
git commit -m "feat: app shell — header, sidebar, language toggle, calculator routing"
```

---

## Task 5: Input Form

**Files:**
- Create: `src/calculators/guywire/GuyWireInputs.jsx`

Default state (12 m mast, 2 levels):
```js
const DEFAULT_CONFIG = {
  mastHeight: 12,
  levels: 2,
  levelConfig: [
    { height: 6,  radius: 5, wires: 3 },
    { height: 11, radius: 8, wires: 3 },
    { height: 0,  radius: 0, wires: 3 }, // slot for level 3 (inactive)
    { height: 0,  radius: 0, wires: 3 }, // slot for level 4 (inactive)
  ],
}
```

- [ ] **Step 1: Create `src/calculators/guywire/GuyWireInputs.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.js'

const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

export default function GuyWireInputs({ config, onChange }) {
  const { t } = useLanguage()

  function setField(field, value) {
    onChange({ ...config, [field]: value })
  }

  function setLevelField(index, field, value) {
    const levelConfig = config.levelConfig.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    )
    onChange({ ...config, levelConfig })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('sidebarCalculators')} / Inputs
      </p>

      {/* Global settings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Mast height */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('mastHeight')} (m)</label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={config.mastHeight}
            onChange={e => setField('mastHeight', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Number of levels */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t('levels')}</label>
          <div className="flex gap-1">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setField('levels', n)}
                className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                  config.levels === n
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-900 border border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Per-level settings */}
      <div className="border-t border-slate-700 pt-3">
        <div className="grid grid-cols-4 gap-2 mb-1 text-xs text-slate-500">
          <span>{t('levelLabel')}</span>
          <span>{t('heightLabel')}</span>
          <span>{t('radiusLabel')}</span>
          <span>{t('wiresLabel')}</span>
        </div>

        {Array.from({ length: config.levels }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
            <span className={`text-sm font-medium ${LEVEL_COLORS[i]}`}>
              {t('levelLabel')} {i + 1}
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.levelConfig[i].height}
              onChange={e => setLevelField(i, 'height', parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.levelConfig[i].radius}
              onChange={e => setLevelField(i, 'radius', parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-1">
              {[3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setLevelField(i, 'wires', n)}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                    config.levelConfig[i].wires === n
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-900 border border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/guywire/GuyWireInputs.jsx
git commit -m "feat: guy wire input form with per-level height, radius, and wire count"
```

---

## Task 6: SVG Diagram

**Files:**
- Create: `src/calculators/guywire/GuyWireDiagram.jsx`

- [ ] **Step 1: Create `src/calculators/guywire/GuyWireDiagram.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.js'

const LEVEL_COLORS = ['#34d399', '#f59e0b', '#f87171', '#a78bfa']
const SVG_W = 220
const SVG_H = 240
const MAST_X = 110
const GROUND_Y = 210
const TOP_Y = 20

export default function GuyWireDiagram({ config, results }) {
  const { t } = useLanguage()

  if (!results || results.levels.length === 0) return null

  const mastHeightM = config.mastHeight || 1
  // Scale: max mast height fills SVG_H - TOP_Y - (SVG_H - GROUND_Y)
  const scale = (GROUND_Y - TOP_Y) / mastHeightM

  // Max radius in meters → max horizontal extent in SVG units
  const maxRadiusM = Math.max(...config.levelConfig.slice(0, config.levels).map(l => l.radius), 1)
  // Anchor points spread left from mast; ensure they fit in SVG
  const radiusScale = Math.min((MAST_X - 10) / maxRadiusM, scale)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        {t('diagramTitle')}
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`}
        className="w-full"
        style={{ maxHeight: 280 }}
      >
        {/* Ground line */}
        <line x1="0" y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#334155" strokeWidth="2" />
        <text x={MAST_X} y={GROUND_Y + 14} fill="#475569" fontSize="9" textAnchor="middle">
          {t('ground')}
        </text>

        {/* Mast */}
        <line x1={MAST_X} y1={TOP_Y} x2={MAST_X} y2={GROUND_Y} stroke="#60a5fa" strokeWidth="3" />

        {/* Mast top label */}
        <text x={MAST_X + 6} y={TOP_Y + 4} fill="#60a5fa" fontSize="8">
          {mastHeightM}m
        </text>

        {/* Guy wires per level */}
        {config.levelConfig.slice(0, config.levels).map((lc, i) => {
          const attachY = GROUND_Y - lc.height * scale
          const anchorX = MAST_X - lc.radius * radiusScale
          const color = LEVEL_COLORS[i]
          return (
            <g key={i}>
              {/* Wire line */}
              <line
                x1={MAST_X}
                y1={attachY}
                x2={anchorX}
                y2={GROUND_Y}
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              {/* Anchor point */}
              <circle cx={anchorX} cy={GROUND_Y} r="3" fill={color} />
              {/* Attach point on mast */}
              <circle cx={MAST_X} cy={attachY} r="2.5" fill={color} />
              {/* Height label */}
              <text x={MAST_X + 5} y={attachY + 3} fill={color} fontSize="8">
                {lc.height}m
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/guywire/GuyWireDiagram.jsx
git commit -m "feat: SVG side-view diagram with color-coded guy wire levels"
```

---

## Task 7: Results Table

**Files:**
- Create: `src/calculators/guywire/GuyWireResults.jsx`

- [ ] **Step 1: Create `src/calculators/guywire/GuyWireResults.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.js'

const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

function fmt(n, decimals = 2) {
  return n.toFixed(decimals)
}

export default function GuyWireResults({ results }) {
  const { t } = useLanguage()

  if (!results || results.levels.length === 0) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
        {t('resultsTitle')}
      </p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-slate-500">
            <th className="text-left pb-2 border-b border-slate-700 pr-3">{t('colLevel')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3">{t('colWireLength')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3">{t('colAngleH')}</th>
            <th className="text-right pb-2 border-b border-slate-700 pr-3">{t('colAngleM')}</th>
            <th className="text-right pb-2 border-b border-slate-700">{t('colTotalLevel')}</th>
          </tr>
        </thead>
        <tbody>
          {results.levels.map((level, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-slate-900/30' : ''}>
              <td className={`py-2 pr-3 font-medium ${LEVEL_COLORS[i]}`}>
                {i + 1}
              </td>
              <td className="py-2 pr-3 text-right text-slate-200">
                {fmt(level.wireLength)} {t('unit_m')}
                <span className="text-slate-500 text-xs ml-1">({t('perWire')})</span>
              </td>
              <td className="py-2 pr-3 text-right text-slate-200">
                {fmt(level.angleFromHorizontal, 1)}{t('unit_deg')}
              </td>
              <td className="py-2 pr-3 text-right text-slate-200">
                {fmt(level.angleFromMast, 1)}{t('unit_deg')}
              </td>
              <td className="py-2 text-right text-slate-200">
                {fmt(level.totalLengthPerLevel)} {t('unit_m')}
                <span className="text-slate-500 text-xs ml-1">×{level.wires}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-700">
            <td colSpan="4" className="pt-3 text-slate-400 text-sm">{t('grandTotal')}</td>
            <td className="pt-3 text-right text-blue-400 font-semibold text-sm">
              {fmt(results.grandTotalLength)} {t('unit_m')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/guywire/GuyWireResults.jsx
git commit -m "feat: results table with wire length, angles, and grand total"
```

---

## Task 8: GuyWireCalc Orchestrator

**Files:**
- Modify: `src/calculators/guywire/GuyWireCalc.jsx` (replace placeholder)

- [ ] **Step 1: Replace `src/calculators/guywire/GuyWireCalc.jsx`**

```jsx
import { useState, useMemo } from 'react'
import GuyWireInputs from './GuyWireInputs.jsx'
import GuyWireDiagram from './GuyWireDiagram.jsx'
import GuyWireResults from './GuyWireResults.jsx'
import { calculateGuyWires } from './guywire.js'

const DEFAULT_CONFIG = {
  mastHeight: 12,
  levels: 2,
  levelConfig: [
    { height: 6,  radius: 5,  wires: 3 },
    { height: 11, radius: 8,  wires: 3 },
    { height: 0,  radius: 0,  wires: 3 },
    { height: 0,  radius: 0,  wires: 3 },
  ],
}

export default function GuyWireCalc() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const results = useMemo(() => {
    try {
      return calculateGuyWires(config)
    } catch {
      return null
    }
  }, [config])

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <GuyWireInputs config={config} onChange={setConfig} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuyWireDiagram config={config} results={results} />
        <GuyWireResults results={results} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full app in browser**

```bash
npm run dev
```

Expected:
- Header with 📡 title and DE/EN toggle
- Sidebar with Abspannung active
- Input form with default 12 m mast, 2 levels, correct per-level values
- SVG side view showing 2 color-coded guy wire lines
- Results table with wire lengths, angles, grand total
- Changing inputs updates diagram and table in real time
- Language toggle switches all labels between DE and EN

- [ ] **Step 3: Run all tests and lint**

```bash
npm test && npm run lint
```

Expected: All tests PASS, 0 lint warnings.

- [ ] **Step 4: Commit**

```bash
git add src/calculators/guywire/GuyWireCalc.jsx
git commit -m "feat: GuyWireCalc orchestrator — wires inputs, diagram, and results together"
```

---

## Task 9: Dual Build & Final Verification

**Files:**
- Verify `vite.config.js` (already written in Task 1)

- [ ] **Step 1: Run standard build**

```bash
npm run build
```

Expected: `dist/` created, no errors.

- [ ] **Step 2: Preview standard build**

```bash
npm run preview
```

Expected: App runs correctly on preview URL. Verify inputs, diagram, results, and language toggle all work.

- [ ] **Step 3: Run standalone build**

```bash
npm run build:standalone
```

Expected: `dist-standalone/` created with a single `.html` file.

- [ ] **Step 4: Verify standalone file**

Open `dist-standalone/index.html` directly in a browser (file:// URL, no server). Expected: Full app works offline with no network requests needed.

- [ ] **Step 5: Run full checks one last time**

```bash
npm test && npm run lint
```

Expected: All tests PASS, 0 lint warnings.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: dual build verified — standard SPA + standalone HTML"
```
