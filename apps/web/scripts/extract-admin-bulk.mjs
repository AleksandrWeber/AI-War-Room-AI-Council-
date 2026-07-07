import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appPath = join(root, 'src/App.tsx')

const snapshotPath = join(root, 'scripts/.app-source-snapshot.tsx')
const appSource = readFileSync(snapshotPath, 'utf8')
const appLines = appSource.split('\n')

function sliceLines(start, end) {
  return appLines.slice(start - 1, end).join('\n')
}

function transformJsxToProps(jsx) {
  let content = jsx

  const replacements = [
    [/\bhandleExportRunHistory\b/g, 'props.handleExportRunHistory'],
    [/\bhandle([A-Z][A-Za-z0-9]*)AdminAction\b/g, 'props.handle$1AdminAction'],
    [/\bbillingAction\b/g, 'props.billingAction'],
    [/\b([a-z][a-zA-Z0-9]*AdminSummary)\b/g, 'props.$1'],
    [/\b(?!handle|format)([a-z][a-zA-Z0-9]*AdminAction)\b/g, 'props.$1'],
  ]

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement)
  }

  return content
}

function collectFormatFunctions(content) {
  const names = new Set()
  for (const match of content.matchAll(/\b(format[A-Z][A-Za-z0-9]*)\(/g)) {
    names.add(match[1])
  }
  return [...names].sort()
}

function buildUiImports(formatFns) {
  const importBlocks = [...appSource.matchAll(/import \{([^}]+)\} from '(\.\/[^']+-ui)'/g)]
  const byModule = new Map()

  for (const fn of formatFns) {
    for (const [, exports, modulePath] of importBlocks) {
      if (exports.split(',').some((part) => part.trim().split(/\s+as\s+/)[0].trim() === fn)) {
        if (!byModule.has(modulePath)) {
          byModule.set(modulePath, new Set())
        }
        byModule.get(modulePath).add(fn)
        break
      }
    }
  }

  return [...byModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([modulePath, fns]) => {
      const sorted = [...fns].sort()
      return `import {\n  ${sorted.join(',\n  ')},\n} from '${modulePath.replace('./', '../../')}'`
    })
    .join('\n')
}

function buildComponent(name, jsx, webBlocksImports = '', untransformedPrefix = '') {
  const transformed = transformJsxToProps(jsx)
  const body = untransformedPrefix
    ? `${untransformedPrefix}\n\n${transformed}`
    : transformed
  const formatFns = collectFormatFunctions(body)
  const uiImports = buildUiImports(formatFns)
  const blocksImport = webBlocksImports
    ? `import { ${webBlocksImports} } from '@ai-war-room/web-blocks'\n`
    : ''

  return `${blocksImport}// @ts-nocheck
${uiImports}

export type ${name}Props = Record<string, unknown>

export default function ${name}(props: ${name}Props) {
  return (
    <>
${body}
    </>
  )
}
`
}

// 1-based line ranges from App.tsx billing admin section
// Usage admin stays in App.tsx via UsageAdminPanel from web-blocks.
const coreOpsJsx = sliceLines(37361, 38111)
const domainJsx = sliceLines(38113, 72393)

const operationsSource = buildComponent('OperationsAdminBulk', coreOpsJsx)
const domainSource = buildComponent('DomainAdminBulk', domainJsx)

const operationsDir = join(root, 'src/features/operations-admin')
const domainDir = join(root, 'src/features/domain-admin')
mkdirSync(operationsDir, { recursive: true })
mkdirSync(domainDir, { recursive: true })

writeFileSync(join(operationsDir, 'OperationsAdminBulk.tsx'), operationsSource)
writeFileSync(join(domainDir, 'DomainAdminBulk.tsx'), domainSource)

console.log('Wrote OperationsAdminBulk.tsx and DomainAdminBulk.tsx')
console.log(`Operations: ${operationsSource.split('\n').length} lines`)
console.log(`Domain: ${domainSource.split('\n').length} lines`)
