import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const bulkPath = join(root, 'src/features/domain-admin/DomainAdminBulk.tsx')

let source = readFileSync(bulkPath, 'utf8')

if (!source.includes('DomainCoverageAdminPanel')) {
  source = source.replace(
    'export type DomainAdminBulkProps = Record<string, unknown>',
    `import { DomainCoverageAdminPanel } from '@ai-war-room/web-blocks'

export type DomainAdminBulkProps = Record<string, unknown>`,
  )
}

function normalizeExpression(expression) {
  const trimmed = expression.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

function formatStatValue(value) {
  const trimmed = value.trim()
  const suffixMatch = trimmed.match(/^\{([\s\S]+)\}(%|ms)$/)
  if (suffixMatch) {
    return `\`${'${'}${suffixMatch[1].trim()}}${suffixMatch[2]}\``
  }

  return normalizeExpression(trimmed)
}

function formatStatDetail(detail) {
  const normalized = detail.trim()
  if (!normalized) {
    return "''"
  }

  if (normalized.includes('{') || normalized.includes('<')) {
    return `<>${normalized}</>`
  }

  return `'${normalized.replace(/'/g, "\\'")}'`
}

function parseStats(statsSection) {
  const articles = [
    ...statsSection.matchAll(/<article className="billing-admin-stat">([\s\S]*?)<\/article>/g),
  ]

  return articles.map(([, body]) => {
    const label = body.match(/<span>([\s\S]*?)<\/span>/)?.[1]?.trim()
    const value = body.match(/<strong>([\s\S]*?)<\/strong>/)?.[1]?.trim()
    const detail = body.match(/<small>([\s\S]*?)<\/small>/)?.[1]?.trim()
    return { label, value, detail }
  })
}

function convertPanel(block, summaryKey) {
  const actionKey = summaryKey.replace('AdminSummary', 'AdminAction')
  const baseName = summaryKey.replace('AdminSummary', '')
  const handleKey = `handle${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}AdminAction`

  const title = block.match(/<span>([^<]+)<\/span>/)?.[1]?.trim()
  const panelClassName = block.match(/workspace-[a-z0-9-]+-admin/)?.[0]
  const listClassName = block.match(/workspace-[a-z0-9-]+-list/)?.[0]
  const cardClassName = block.match(/workspace-[a-z0-9-]+-card/)?.[0]

  const statsSection = block.match(/<div className="billing-admin__stats">([\s\S]*?)<\/div>/)?.[1]
  const stats = parseStats(statsSection ?? '')

  const refreshAction = block.match(/'([^']+_summary)'/)?.[1]
  const formatDomainMatch = block.match(/format([A-Za-z0-9]+)Domain\(/)
  const formatActionMatch = block.match(/format([A-Za-z0-9]+)AdminAction\(/)

  if (
    !title ||
    !panelClassName ||
    !listClassName ||
    !cardClassName ||
    stats.length !== 2 ||
    !refreshAction ||
    !formatDomainMatch ||
    !formatActionMatch
  ) {
    return null
  }

  const formatDomain = `format${formatDomainMatch[1]}Domain`
  const formatAdminAction = `format${formatActionMatch[1]}AdminAction`

  const statsLines = stats
    .map(
      (stat) => `            {
              label: '${stat.label}',
              value: ${formatStatValue(stat.value)},
              detail: ${formatStatDetail(stat.detail)},
            }`,
    )
    .join(',\n')

  return `{props.${summaryKey} ? (
          <DomainCoverageAdminPanel
            title="${title}"
            panelClassName="${panelClassName}"
            listClassName="${listClassName}"
            cardClassName="${cardClassName}"
            role={props.${summaryKey}.role}
            guidance={props.${summaryKey}.guidance}
            stats={[
${statsLines}
            ]}
            records={props.${summaryKey}.records}
            availableActions={props.${summaryKey}.availableActions}
            refreshAction="${refreshAction}"
            actionBusy={props.${actionKey} !== 'idle'}
            formatDomain={${formatDomain} as (domain: string) => string}
            formatAdminAction={${formatAdminAction} as (action: string) => string}
            onRefresh={() =>
              void props.${handleKey}('${refreshAction}')
            }
          />
        ) : null}`
}

const panelPattern =
  /\{props\.(\w+AdminSummary) \? \([\s\S]*?\n        \) : null\}/g

let converted = 0
let skipped = 0

source = source.replace(panelPattern, (full, summaryKey) => {
  const inner = full.slice(`{props.${summaryKey} ? (`.length, -'        ) : null}'.length)
  const replacement = convertPanel(inner, summaryKey)
  if (!replacement) {
    skipped += 1
    return full
  }
  converted += 1
  return replacement
})

writeFileSync(bulkPath, source)

console.log(`Converted ${converted} domain panels, skipped ${skipped}`)
