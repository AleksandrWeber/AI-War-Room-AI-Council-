import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const bulkPath = join(root, 'src/features/operations-admin/OperationsAdminBulk.tsx')

let source = readFileSync(bulkPath, 'utf8')

if (!source.includes('BillingAdminPanel')) {
  source = source.replace(
    '// @ts-nocheck',
    "// @ts-nocheck\nimport { AdminExportActions, BillingAdminPanel } from '@ai-war-room/web-blocks'",
  )
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

function convertPanel(block) {
  const title = block.match(/<span>([^<]+)<\/span>/)?.[1]?.trim()
  const panelClassName = block.match(/workspace-[a-z0-9-]+-admin/)?.[0]
  const statsSection = block.match(/<div className="billing-admin__stats">([\s\S]*?)<\/div>/)?.[1]
  const stats = parseStats(statsSection ?? '')

  const bodyStart = block.indexOf('</div>', block.indexOf('billing-admin__stats')) + 6
  const bodyEnd = block.lastIndexOf('</div>')
  const body = block.slice(bodyStart, bodyEnd).trim()

  if (!title || !panelClassName || stats.length !== 2) {
    return null
  }

  const roleMatch = block.match(/<strong>\{([^}]+)\}<\/strong>/)
  const guidanceMatch = block.match(/<p>\{([^}]+)\}<\/p>/)
  if (!roleMatch || !guidanceMatch) {
    return null
  }

  const statsLines = stats
    .map(
      (stat) => `            {
              label: '${stat.label}',
              value: ${formatStatValue(stat.value)},
              detail: ${formatStatDetail(stat.detail)},
            }`,
    )
    .join(',\n')

  let children = body
  children = children.replace(
    /<div className="billing-export-actions">([\s\S]*?)<\/div>/g,
    (exportBlock) => {
      const buttons = [...exportBlock.matchAll(/onClick=\{\(\) => void ([^}]+)\}\}[\s\S]*?>\s*([^<]+)\s*</g)]
      if (!buttons.length) {
        return exportBlock
      }

      const actions = buttons
        .map(
          ([, handler, label]) => `          {
            label: '${label.trim()}',
            disabled: ${handler.includes('handleExportRunHistory') ? 'props.runHistoryAdminAction !== \'idle\'' : 'false'},
            onClick: () => void ${handler.trim()},
          }`,
        )
        .join(',\n')

      return `<AdminExportActions
            actions={[
${actions}
            ]}
          />`
    },
  )

  return `<BillingAdminPanel
            title="${title}"
            panelClassName="${panelClassName}"
            role={${roleMatch[1]}}
            guidance={${guidanceMatch[1]}}
            stats={[
${statsLines}
            ]}
          >
${children}
          </BillingAdminPanel>`
}

const panelPattern =
  /<div className="billing-admin (workspace-[a-z0-9-]+-admin)">([\s\S]*?)<\/div>\s*(?=\)|<\/BillingAdminPanel>|<AdminExportActions>|<\/>|\{props\.)/g

let converted = 0
source = source.replace(
  /\{props\.(\w+AdminSummary) \? \(\s*<div className="billing-admin (workspace-[a-z0-9-]+-admin)">([\s\S]*?)\s*<\/div>\s*\) : null\}/g,
  (full, summaryKey, panelClass, inner) => {
    const block = `<div className="billing-admin ${panelClass}">${inner}</div>`
    const replacement = convertPanel(block)
    if (!replacement) {
      return full
    }
    converted += 1
    return `{props.${summaryKey} ? (
          ${replacement}
        ) : null}`
  },
)

writeFileSync(bulkPath, source)
console.log(`Converted ${converted} operations admin panels`)
