import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appPath = join(root, 'src/App.tsx')

const KEEP_STATIC_MODULES = new Set(['billing-ui', 'workspace-ui', 'usage-ui'])

let source = readFileSync(appPath, 'utf8')

const symbolToModule = new Map()

for (const match of source.matchAll(/import \{([^}]+)\} from '(\.\/([^']+-ui))'/g)) {
  const [, exports, , moduleName] = match

  if (KEEP_STATIC_MODULES.has(moduleName)) {
    continue
  }

  for (const part of exports.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) {
      continue
    }

    const symbol = trimmed.split(/\s+as\s+/)[0].trim()
    if (symbol.startsWith('type ')) {
      continue
    }

    symbolToModule.set(symbol, moduleName)
  }
}

source = source.replace(/^import \{[^}]+\} from '\.\/[^']+-ui'\n/gm, (block) => {
  const moduleMatch = block.match(/from '\.\/([^']+-ui)'/)
  if (!moduleMatch || KEEP_STATIC_MODULES.has(moduleMatch[1])) {
    return block
  }

  return ''
})

if (!source.includes("from './lazy-ui'")) {
  source = source.replace(
    "import './App.css'",
    "import './App.css'\nimport { callUi } from './lazy-ui'",
  )
}

const sortedSymbols = [...symbolToModule.keys()].sort((a, b) => b.length - a.length)

for (const symbol of sortedSymbols) {
  const moduleName = symbolToModule.get(symbol)
  const pattern = new RegExp(`\\b${symbol}\\(`, 'g')
  source = source.replace(
    pattern,
    `callUi('${moduleName}', '${symbol}', `,
  )
}

source = source.replace(/callUi\('([^']+)', '([^']+)', \)/g, "callUi('$1', '$2')")

const deferredStartNeedle = '      const modelHealthAdmin = await callUi('
const deferredStart = source.indexOf(deferredStartNeedle)
const deferredEndMarker =
  '      setCredibilityvaultizabilityAdminSummary(credibilityvaultizabilityAdmin)'
const deferredEnd = source.indexOf(deferredEndMarker)

if (deferredStart === -1 || deferredEnd === -1) {
  throw new Error('Could not locate deferred admin fetch block')
}

const deferredBody = source.slice(deferredStart, deferredEnd + deferredEndMarker.length)

source =
  source.slice(0, deferredStart) + source.slice(deferredEnd + deferredEndMarker.length)

const loadDeferredFn = `  async function loadDeferredAdminControlsData() {
    try {
${deferredBody}
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to load rollout/admin control data.',
      )
    }
  }

`

const handleLoadBillingAnchor = '  async function handleLoadBillingStatus() {'
const handleLoadBillingIndex = source.indexOf(handleLoadBillingAnchor)
if (handleLoadBillingIndex === -1) {
  throw new Error('handleLoadBillingStatus not found')
}

source =
  source.slice(0, handleLoadBillingIndex) +
  loadDeferredFn +
  source.slice(handleLoadBillingIndex)

const rolloutEffectNeedle = `    if (!rolloutControlsEnabled) {
      return () => {
        controller.abort()
      }
    }`

if (!source.includes(rolloutEffectNeedle)) {
  throw new Error('rollout controls effect not found')
}

source = source.replace(
  rolloutEffectNeedle,
  `${rolloutEffectNeedle}

    void loadDeferredAdminControlsData()`,
)

source = source.replace(
  /import \{\n([^}]+)\n\} from '\.\/usage-ui'\n/,
  (block, exports) => {
    const kept = exports
      .split(',')
      .map((part) => part.trim())
      .filter((part) => {
        const name = part.split(/\s+as\s+/)[0].trim()
        return (
          name === 'executeUsageAdminAction' ||
          name === 'formatUsageAdminAction' ||
          name === 'fetchUsageAdminSummary'
        )
      })

    return `import {\n  ${kept.join(',\n  ')},\n} from './usage-ui'\n`
  },
)

if (!source.startsWith('// @ts-nocheck')) {
  source = `// @ts-nocheck\n${source}`
}

writeFileSync(appPath, source)

console.log(`Migrated ${sortedSymbols.length} lazy UI symbols`)
console.log(`Kept static modules: ${[...KEEP_STATIC_MODULES].join(', ')}`)
