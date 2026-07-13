#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appPath = join(root, 'src/App.tsx')
const billingReturnPath = join(root, 'src/billing-return.ts')
const billingUiPath = join(root, 'src/billing-ui.ts')

const billingReturnSource = `export type BillingReturnHint = 'success' | 'cancel' | 'portal'

export function readBillingReturnHint(): BillingReturnHint | null {
  const url = new URL(window.location.href)

  if (
    url.searchParams.get('billing') === 'success' ||
    url.pathname.endsWith('/billing/success')
  ) {
    return 'success'
  }

  if (
    url.searchParams.get('billing') === 'cancel' ||
    url.pathname.endsWith('/billing/cancel')
  ) {
    return 'cancel'
  }

  if (
    url.searchParams.get('billing') === 'portal' ||
    url.pathname.endsWith('/billing/portal')
  ) {
    return 'portal'
  }

  return null
}

export function clearBillingReturnHint() {
  const url = new URL(window.location.href)
  url.searchParams.delete('billing')

  if (
    url.pathname.endsWith('/billing/success') ||
    url.pathname.endsWith('/billing/cancel') ||
    url.pathname.endsWith('/billing/portal')
  ) {
    url.pathname = '/'
  }

  window.history.replaceState({}, '', url)
}
`

writeFileSync(billingReturnPath, billingReturnSource)

let billingUi = readFileSync(billingUiPath, 'utf8')
billingUi = billingUi.replace(
  /export type BillingReturnHint = 'success' \| 'cancel' \| 'portal'\n\nexport function readBillingReturnHint\(\): BillingReturnHint \| null \{[\s\S]*?^}\n\nexport function clearBillingReturnHint\(\) \{[\s\S]*?^}\n\n/m,
  `export type { BillingReturnHint } from './billing-return.js'\nexport {\n  clearBillingReturnHint,\n  readBillingReturnHint,\n} from './billing-return.js'\n\n`,
)
writeFileSync(billingUiPath, billingUi)

let source = readFileSync(appPath, 'utf8')

const billingImport =
  /import \{\n(?:  [^\n]+\n)+\} from '\.\/billing-ui'\n/
const workspaceImport =
  /import \{\n(?:  [^\n]+\n)+\} from '\.\/workspace-ui'\n/

if (!billingImport.test(source) || !workspaceImport.test(source)) {
  throw new Error('Could not find billing-ui / workspace-ui import blocks')
}

source = source.replace(billingImport, '')
source = source.replace(workspaceImport, '')

if (!source.includes("from './billing-return'")) {
  source = source.replace(
    "import { callUi } from './lazy-ui'",
    `import { callUi } from './lazy-ui'\nimport {\n  clearBillingReturnHint,\n  readBillingReturnHint,\n} from './billing-return'`,
  )
}

if (!source.includes('formatPaidTier')) {
  // insert near other web-blocks usage later via direct import below
}

if (!source.includes("formatPaidTier } from '@ai-war-room/web-blocks'") &&
    !source.includes('formatPaidTier,')) {
  // App may already import many things from schemas; add web-blocks import
}

// Ensure MockCustomerPortalResponse comes from schemas import block
if (!source.includes('MockCustomerPortalResponse,')) {
  source = source.replace(
    '  BillingAdminSummaryResponse,\n',
    '  BillingAdminSummaryResponse,\n  MockCustomerPortalResponse,\n',
  )
}

if (!source.includes("from '@ai-war-room/web-blocks'")) {
  source = source.replace(
    "import { callUi } from './lazy-ui'",
    `import { formatPaidTier } from '@ai-war-room/web-blocks'\nimport { callUi } from './lazy-ui'`,
  )
} else if (!source.includes('formatPaidTier')) {
  source = source.replace(
    /import \{([^}]+)\} from '@ai-war-room\/web-blocks'/,
    (block, inner) => {
      const trimmed = inner.trim()
      return `import {\n  formatPaidTier,\n  ${trimmed}\n} from '@ai-war-room/web-blocks'`
    },
  )
}

if (!source.includes('const defaultWorkspaceId =')) {
  source = source.replace(
    "const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'",
    "const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'\nconst defaultWorkspaceId = 'local_workspace'",
  )
}

const billingFns = [
  'fetchBillingCapabilities',
  'fetchBillingRollout',
  'fetchBillingWorkspaceStatus',
  'fetchBillingWebhookEvents',
  'fetchBillingInvoices',
  'fetchBillingUsageSummary',
  'fetchBillingAlerts',
  'fetchBillingMeterUsageReports',
  'fetchBillingNotifications',
  'fetchBillingAdminSummary',
  'executeBillingAdminAction',
  'downloadBillingInvoiceExport',
  'createBillingCheckoutSession',
  'completeMockBillingCheckout',
  'createCustomerPortalSession',
  'fetchMockCustomerPortal',
  'cancelMockCustomerPortalSubscription',
]

const workspaceFns = [
  'fetchWorkspaceMemberAdminSummary',
  'fetchWorkspaceSettingsAdminSummary',
  'executeWorkspaceMemberAdminAction',
  'executeWorkspaceSettingsAdminAction',
  'downloadWorkspaceAuditExport',
]

for (const fn of billingFns) {
  const pattern = new RegExp(`\\b${fn}\\(`, 'g')
  source = source.replace(pattern, `callUi('billing-ui', '${fn}', `)
}

for (const fn of workspaceFns) {
  const pattern = new RegExp(`\\b${fn}\\(`, 'g')
  source = source.replace(pattern, `callUi('workspace-ui', '${fn}', `)
}

source = source.replace(/callUi\('([^']+)', '([^']+)', \)/g, "callUi('$1', '$2')")

writeFileSync(appPath, source)
console.log('Migrated billing-ui and workspace-ui to lazy callUi loading.')
