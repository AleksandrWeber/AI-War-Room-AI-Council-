import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appPath = join(root, 'src/App.tsx')
const opsPath = join(root, 'src/features/operations-admin/OperationsAdminBulk.tsx')
const domainPath = join(root, 'src/features/domain-admin/DomainAdminBulk.tsx')

const appLines = readFileSync(appPath, 'utf8').split('\n')
const opsSource = readFileSync(opsPath, 'utf8')
const domainSource = readFileSync(domainPath, 'utf8')

function collectPropNames(source) {
  const names = new Set()
  for (const match of source.matchAll(/props\.([A-Za-z0-9]+)/g)) {
    names.add(match[1])
  }
  return [...names].sort()
}

function formatPropsObject(names, indent) {
  const pad = ' '.repeat(indent)
  const inner = ' '.repeat(indent + 2)
  return `{\n${names.map((name) => `${inner}${name},`).join('\n')}\n${pad}}`
}

const opsPropNames = collectPropNames(opsSource)
const domainPropNames = collectPropNames(domainSource)

const usageReplacement = `{rolloutControlsEnabled &&
        usageCapabilities?.supportsUsageAdminTools &&
        usageAdminSummary ? (
          <UsageAdminPanel
            summary={usageAdminSummary}
            billingAction={billingAction}
            usageAdminAction={usageAdminAction}
            billingAdminAction={billingAdminAction}
            formatAction={formatUsageAdminAction as (action: string) => string}
            onClick={(action) => void handleUsageAdminAction(action)}
          />
        ) : null}`

// Fix onAction not onClick
const usageBlock = `{rolloutControlsEnabled &&
        usageCapabilities?.supportsUsageAdminTools &&
        usageAdminSummary ? (
          <UsageAdminPanel
            summary={usageAdminSummary}
            billingAction={billingAction}
            usageAdminAction={usageAdminAction}
            billingAdminAction={billingAdminAction}
            formatAction={formatUsageAdminAction as (action: string) => string}
            onAction={(action) => void handleUsageAdminAction(action)}
          />
        ) : null}`

const opsGate = `        <CoreOperationsAdminLazyGate
          enabled={rolloutControlsEnabled}
          adminProps={${formatPropsObject(opsPropNames, 10).replace(/^\{/, '').replace(/\}$/, '')}}
        />`

// Fix opsGate - formatPropsObject returns full braces
const opsGateBlock = `        <CoreOperationsAdminLazyGate
          enabled={rolloutControlsEnabled}
          adminProps={${formatPropsObject(opsPropNames, 10)}}
        />`

const domainGateBlock = `        <DomainAdminLazyGate
          enabled={rolloutControlsEnabled}
          adminProps={${formatPropsObject(domainPropNames, 10)}}
        />`

// 1-based inclusive line ranges in current App.tsx
const usageStart = 37283
const usageEnd = 37333
const coreStart = 37361
const coreEnd = 38111
const domainStart = 38113
const domainEnd = 72393

let lines = [...appLines]

function insertBlock(lines, start, end, block) {
  lines.splice(start - 1, end - start + 1, ...block.split('\n'))
}

// Remove from bottom to top (line numbers from committed App.tsx)
insertBlock(lines, domainStart, domainEnd, domainGateBlock)
insertBlock(lines, coreStart, coreEnd, opsGateBlock)
insertBlock(lines, usageStart, usageEnd, usageBlock)

let appSource = lines.join('\n')

if (!appSource.includes("UsageAdminPanel } from '@ai-war-room/web-blocks'")) {
  appSource = appSource.replace(
    "import { BillingWorkspacePanel } from '@ai-war-room/web-blocks'",
    "import { BillingWorkspacePanel, UsageAdminPanel } from '@ai-war-room/web-blocks'",
  )
}
if (!appSource.includes("from './features/AdminLazySection'")) {
  appSource = appSource.replace(
    "import { RolloutAdminLazyGate, WorkspaceAdminLazySection } from './features/RolloutAdminLazySection'",
    "import { CoreOperationsAdminLazyGate, DomainAdminLazyGate } from './features/AdminLazySection'\nimport { RolloutAdminLazyGate, WorkspaceAdminLazySection } from './features/RolloutAdminLazySection'",
  )
}

// Remove format* imports from *-ui modules, keep fetch/execute/download
appSource = appSource.replace(
  /^import \{([^}]+)\} from '(\.\/[^']+-ui)'\n/gm,
  (full, exports, modulePath) => {
    const kept = exports
      .split(',')
      .map((part) => part.trim())
      .filter((part) => {
        if (!part) {
          return false
        }
        const name = part.split(/\s+as\s+/)[0].trim()
        if (name.startsWith('format')) {
          return name === 'formatUsageAdminAction' || name === 'formatPaidTier'
        }
        return true
      })
    if (!kept.length) {
      return ''
    }
    return `import {\n  ${kept.join(',\n  ')},\n} from '${modulePath}'\n`
  },
)

writeFileSync(appPath, appSource)

console.log('Patched App.tsx')
console.log(`Operations props: ${opsPropNames.length}`)
console.log(`Domain props: ${domainPropNames.length}`)
console.log(`App lines: ${appSource.split('\n').length}`)
