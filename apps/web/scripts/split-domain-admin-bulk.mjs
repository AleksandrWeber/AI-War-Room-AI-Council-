#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/features/domain-admin')
const sourcePath = join(dir, 'DomainAdminBulk.tsx')
const source = readFileSync(sourcePath, 'utf8')

const importBlockEnd = source.indexOf("import { DomainCoverageAdminPanel } from '@ai-war-room/web-blocks'")
if (importBlockEnd === -1) {
  throw new Error('Could not find DomainCoverageAdminPanel import')
}

const formatterImports = source.slice(0, importBlockEnd)
const symbolToImport = new Map()

for (const match of formatterImports.matchAll(
  /import \{\n((?:  [^\n]+\n)+)\} from '([^']+)'\n/g,
)) {
  const [, exportsBlock, fromPath] = match
  const symbols = exportsBlock
    .split('\n')
    .map((line) => line.replace(/,$/, '').trim())
    .filter(Boolean)

  for (const symbol of symbols) {
    symbolToImport.set(symbol, { symbols, fromPath, raw: match[0] })
  }
}

const panelRegex =
  /\n        \{props\.(\w+AdminSummary) \? \([\s\S]*?\n        \) : null\}/g
const panels = []
let match
while ((match = panelRegex.exec(source))) {
  panels.push({
    prop: match[1],
    text: match[0],
  })
}

if (panels.length < 100) {
  throw new Error(`Expected many panels, found ${panels.length}`)
}

const PARTS = 4
const chunkSize = Math.ceil(panels.length / PARTS)
const partFiles = []

for (let partIndex = 0; partIndex < PARTS; partIndex += 1) {
  const partPanels = panels.slice(partIndex * chunkSize, (partIndex + 1) * chunkSize)
  const neededSymbols = new Set()

  for (const panel of partPanels) {
    for (const symbolMatch of panel.text.matchAll(/\b(format[A-Za-z0-9]+)\b/g)) {
      if (
        symbolMatch[1] !== 'formatDomain' &&
        symbolMatch[1] !== 'formatAdminAction'
      ) {
        neededSymbols.add(symbolMatch[1])
      }
    }
  }

  const importBlocks = []
  const seenFrom = new Set()
  for (const symbol of [...neededSymbols].sort()) {
    const info = symbolToImport.get(symbol)
    if (!info) {
      throw new Error(`Missing import for ${symbol}`)
    }
    if (seenFrom.has(info.fromPath)) {
      continue
    }
    seenFrom.add(info.fromPath)
    importBlocks.push(info.raw)
  }

  const fileName = `DomainAdminBulkPart${partIndex + 1}.tsx`
  const content = `// @ts-nocheck
${importBlocks.join('')}
import { DomainCoverageAdminPanel } from '@ai-war-room/web-blocks'
import type { DomainAdminBulkProps } from './DomainAdminBulk'

export default function DomainAdminBulkPart${partIndex + 1}(
  props: DomainAdminBulkProps,
) {
  return (
    <>${partPanels.map((panel) => panel.text).join('')}
    </>
  )
}
`

  writeFileSync(join(dir, fileName), content)
  partFiles.push(fileName)
  console.log(
    `Wrote ${fileName}: ${partPanels.length} panels, ${importBlocks.length} imports`,
  )
}

const shell = `// @ts-nocheck
import { Suspense, lazy } from 'react'

export type DomainAdminBulkProps = Record<string, unknown>

const LazyPart1 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart1')
  return { default: module.default }
})

const LazyPart2 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart2')
  return { default: module.default }
})

const LazyPart3 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart3')
  return { default: module.default }
})

const LazyPart4 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart4')
  return { default: module.default }
})

export default function DomainAdminBulk(props: DomainAdminBulkProps) {
  return (
    <>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 1...</p>}>
        <LazyPart1 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 2...</p>}>
        <LazyPart2 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 3...</p>}>
        <LazyPart3 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 4...</p>}>
        <LazyPart4 {...props} />
      </Suspense>
    </>
  )
}
`

writeFileSync(sourcePath, shell)
console.log(`Split complete: ${panels.length} panels into ${PARTS} lazy parts.`)
