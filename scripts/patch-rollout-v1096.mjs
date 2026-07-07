#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { milestones, patchMeta } from './milestones-v1096-v1100.mjs'

const root = join(import.meta.dirname, '..')
const BASE = {
  name: 'adjustabilityvaultizability',
  Name: 'Adjustabilityvaultizability',
}

const propsAnchor = {
  programmabilityvaultizability: 'programmability',
  deployabilityvaultizability: 'deployability',
  manageabilityvaultizability: 'manageability',
  controllabilityvaultizability: 'controllability',
  integrabilityvaultizability: 'integrability',
}

const bulkImportAnchor = 'adjustabilityvaultizability-ui'

// schemas index
const indexPath = join(root, 'packages/schemas/src/index.ts')
let index = readFileSync(indexPath, 'utf8')
const exportBlock = milestones
  .map(
    (m) =>
      `export * from './${m.name}-rollout.js'\nexport * from './${m.name}-admin.js'`,
  )
  .join('\n')
if (!index.includes('./programmabilityvaultizability-rollout.js')) {
  index = index.replace(
    "export * from './adjustabilityvaultizability-rollout.js'\nexport * from './adjustabilityvaultizability-admin.js'",
    `export * from './adjustabilityvaultizability-rollout.js'\nexport * from './adjustabilityvaultizability-admin.js'\n${exportBlock}`,
  )
  writeFileSync(indexPath, index)
}

// app-rollout.module.ts
const appModulePath = join(root, 'apps/api/src/app-rollout.module.ts')
let appModule = readFileSync(appModulePath, 'utf8')
if (!appModule.includes("from './programmabilityvaultizability/programmabilityvaultizability.module.js'")) {
  const importBlock = milestones
    .map(
      (m) =>
        `import { ${m.Name}Module } from './${m.name}/${m.name}.module.js'`,
    )
    .join('\n')
  const moduleBlock = milestones.map((m) => `    ${m.Name}Module,`).join('\n')
  appModule = appModule.replace(
    "import { AdjustabilityvaultizabilityModule } from './adjustabilityvaultizability/adjustabilityvaultizability.module.js'",
    `import { AdjustabilityvaultizabilityModule } from './adjustabilityvaultizability/adjustabilityvaultizability.module.js'\n${importBlock}`,
  )
  appModule = appModule.replace(
    '    AdjustabilityvaultizabilityModule,',
    `    AdjustabilityvaultizabilityModule,\n${moduleBlock}`,
  )
  writeFileSync(appModulePath, appModule)
}

// integration tests
const testPath = join(
  root,
  'apps/api/src/workspaces/workspace-admin-rollout.integration.test.ts',
)
let tests = readFileSync(testPath, 'utf8')
const generatedTests = readFileSync(
  join(root, 'scripts/generated-integration-tests.txt'),
  'utf8',
)
if (!tests.includes("describe('programmabilityvaultizability rollout integration'")) {
  tests = tests.replace(/\}\)\s*$/, `})${generatedTests}`)
  writeFileSync(testPath, tests)
}

// App.css
const cssPath = join(root, 'apps/web/src/App.css')
let css = readFileSync(cssPath, 'utf8')
for (const m of milestones) {
  if (!css.includes(`.workspace-${m.name}-list`)) {
    css = css.replace(
      '.workspace-settings-form {',
      `.workspace-${m.name}-list {
  display: grid;
  gap: 12px;
}

.workspace-${m.name}-card {
  background: rgba(2, 6, 23, 0.45);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
}

.workspace-${m.name}-card p,
.workspace-${m.name}-card small {
  color: var(--muted);
  margin: 6px 0 0;
}

.workspace-${m.name}-card--ready {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
}

.workspace-${m.name}-card--missing {
  border-color: color-mix(in srgb, #d44 45%, var(--border));
}

.workspace-settings-form {`,
    )
  }
}
writeFileSync(cssPath, css)

// App.tsx state, handlers, lazy fetches, props
const appPath = join(root, 'apps/web/src/App.tsx')
let app = readFileSync(appPath, 'utf8')

if (!app.includes('ProgrammabilityvaultizabilityRolloutResponse')) {
  const typeBlock = patchMeta
    .map(
      (m) =>
        `  ${m.Name}RolloutResponse,\n  ${m.Name}AdminSummaryResponse,`,
    )
    .join('\n')

  app = app.replace(
    '  AdjustabilityvaultizabilityAdminSummaryResponse,\n  RunCapabilitiesResponse,',
    `  AdjustabilityvaultizabilityAdminSummaryResponse,\n${typeBlock}\n  RunCapabilitiesResponse,`,
  )
}

for (const m of patchMeta) {
  if (app.includes(`${m.name}Rollout, set${m.Name}Rollout]`)) continue

  const prevIndex = patchMeta.indexOf(m) - 1
  const prev = prevIndex >= 0 ? patchMeta[prevIndex] : BASE

  app = app.replace(
    `  const [${prev.name}Rollout, set${prev.Name}Rollout] =\n    useState<${prev.Name}RolloutResponse | null>(null)`,
    `  const [${prev.name}Rollout, set${prev.Name}Rollout] =\n    useState<${prev.Name}RolloutResponse | null>(null)\n  const [${m.name}Rollout, set${m.Name}Rollout] =\n    useState<${m.Name}RolloutResponse | null>(null)`,
  )

  app = app.replace(
    `  const [${prev.name}AdminSummary, set${prev.Name}AdminSummary] =\n    useState<${prev.Name}AdminSummaryResponse | null>(null)`,
    `  const [${prev.name}AdminSummary, set${prev.Name}AdminSummary] =\n    useState<${prev.Name}AdminSummaryResponse | null>(null)\n  const [${m.name}AdminSummary, set${m.Name}AdminSummary] =\n    useState<${m.Name}AdminSummaryResponse | null>(null)`,
  )

  app = app.replace(
    `  const [${prev.name}AdminAction, set${prev.Name}AdminAction] = useState<\n    'idle' | 'running'\n  >('idle')`,
    `  const [${prev.name}AdminAction, set${prev.Name}AdminAction] = useState<\n    'idle' | 'running'\n  >('idle')\n  const [${m.name}AdminAction, set${m.Name}AdminAction] = useState<\n    'idle' | 'running'\n  >('idle')`,
  )

  app = app.replace(
    `    callUi('${prev.name}-ui', 'fetch${prev.Name}Rollout', apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          set${prev.Name}Rollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          set${prev.Name}Rollout(null)
        }
      })

    fetchUsageCapabilities(apiBaseUrl)`,
    `    callUi('${prev.name}-ui', 'fetch${prev.Name}Rollout', apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          set${prev.Name}Rollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          set${prev.Name}Rollout(null)
        }
      })

    callUi('${m.name}-ui', 'fetch${m.Name}Rollout', apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          set${m.Name}Rollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          set${m.Name}Rollout(null)
        }
      })

    fetchUsageCapabilities(apiBaseUrl)`,
  )

  app = app.replace(
    `      set${prev.Name}AdminSummary(${prev.name}Admin)`,
    `      set${prev.Name}AdminSummary(${prev.name}Admin)

      const ${m.name}Admin = await callUi('${m.name}-ui', 'fetch${m.Name}AdminSummary', 
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      set${m.Name}AdminSummary(${m.name}Admin)`,
  )

  app = app.replace(
    `  async function handle${prev.Name}AdminAction(`,
    `  async function handle${m.Name}AdminAction(
    action: '${m.action}',
  ) {
    set${m.Name}AdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await callUi('${m.name}-ui', 'execute${m.Name}AdminAction', 
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await callUi('${m.name}-ui', 'fetch${m.Name}Rollout', apiBaseUrl)
      set${m.Name}Rollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run ${m.name} admin action.',
      )
    } finally {
      set${m.Name}AdminAction('idle')
    }
  }

  async function handle${prev.Name}AdminAction(`,
  )

  const anchor = propsAnchor[m.name]
  if (anchor) {
    const anchorName = anchor.charAt(0).toUpperCase() + anchor.slice(1)
    app = app.replace(
      `            ${anchor}Rollout,`,
      `            ${anchor}Rollout,\n            ${m.name}Rollout,`,
    )
    app = app.replace(
      `            ${anchor}AdminSummary,`,
      `            ${anchor}AdminSummary,\n            ${m.name}AdminSummary,`,
    )
    app = app.replace(
      `            ${anchor}AdminAction,`,
      `            ${anchor}AdminAction,\n            ${m.name}AdminAction,`,
    )
    app = app.replace(
      `            handle${anchorName}AdminAction,`,
      `            handle${anchorName}AdminAction,\n            handle${m.Name}AdminAction,`,
    )
  }
}

writeFileSync(appPath, app)

// RolloutAdminBulk.tsx
const rolloutBulkPath = join(
  root,
  'apps/web/src/features/rollout-admin/RolloutAdminBulk.tsx',
)
let rolloutBulk = readFileSync(rolloutBulkPath, 'utf8')

for (const m of patchMeta) {
  if (rolloutBulk.includes(`props.${m.name}Rollout`)) continue

  if (!rolloutBulk.includes(`from '../../${m.name}-ui'`)) {
    rolloutBulk = rolloutBulk.replace(
      `} from '../../${bulkImportAnchor}'`,
      `} from '../../${bulkImportAnchor}'\nimport {\n  format${m.Name}RolloutCheckStatus,\n  format${m.Name}RolloutStatus,\n} from '../../${m.name}-ui'`,
    )
  }

  const panel = `
        {props.${m.name}Rollout ? (
          <RolloutReadinessCard
            title="Production ${m.name} rollout readiness"
            rollout={props.${m.name}Rollout as import('@ai-war-room/web-blocks').RolloutReadinessSnapshot}
            formatStatus={format${m.Name}RolloutStatus as (status: string) => string}
            formatCheckStatus={format${m.Name}RolloutCheckStatus as (status: string) => string}
          />
        ) : null}
`
  rolloutBulk = rolloutBulk.replace(
    '    </>\n  )\n}\n',
    `${panel}    </>\n  )\n}\n`,
  )
}
writeFileSync(rolloutBulkPath, rolloutBulk)

// DomainAdminBulk.tsx
const domainBulkPath = join(
  root,
  'apps/web/src/features/domain-admin/DomainAdminBulk.tsx',
)
let domainBulk = readFileSync(domainBulkPath, 'utf8')

for (const m of patchMeta) {
  if (domainBulk.includes(`props.${m.name}AdminSummary`)) continue

  if (!domainBulk.includes(`from '../../${m.name}-ui'`)) {
    domainBulk = domainBulk.replace(
      `  formatAdjustabilityvaultizabilityDomain,\n} from '../../${bulkImportAnchor}'`,
      `  formatAdjustabilityvaultizabilityDomain,\n} from '../../${bulkImportAnchor}'\nimport {\n  format${m.Name}AdminAction,\n  format${m.Name}Domain,\n} from '../../${m.name}-ui'`,
    )
  }

  const panel = `
        {props.${m.name}AdminSummary ? (
          <DomainCoverageAdminPanel
            title="${m.Name} admin"
            panelClassName="workspace-${m.name}-admin"
            listClassName="workspace-${m.name}-list"
            cardClassName="workspace-${m.name}-card"
            role={props.${m.name}AdminSummary.role}
            guidance={props.${m.name}AdminSummary.guidance}
            stats={[
            {
              label: '${m.metricLabel}',
              value: \`\${props.${m.name}AdminSummary.stats.${m.percent}}%\`,
              detail: <>{props.${m.name}AdminSummary.stats.coveredDomains}/
                  {props.${m.name}AdminSummary.stats.totalDomains} domains covered</>,
            },
            {
              label: '${m.Name} signals',
              value: props.${m.name}AdminSummary.stats.totalRecords,
              detail: <>{props.${m.name}AdminSummary.stats.postgresConnectivity
                    ? '${m.signalsHint}'
                    : 'PostgreSQL unavailable'}</>,
            }
            ]}
            records={props.${m.name}AdminSummary.records}
            availableActions={props.${m.name}AdminSummary.availableActions}
            refreshAction="${m.action}"
            actionBusy={props.${m.name}AdminAction !== 'idle'}
            formatDomain={format${m.Name}Domain as (domain: string) => string}
            formatAdminAction={format${m.Name}AdminAction as (action: string) => string}
            onRefresh={() =>
              void props.handle${m.Name}AdminAction('${m.action}')
            }
          />
        ) : null}
`
  domainBulk = domainBulk.replace('    </>\n  )\n}\n', `${panel}    </>\n  )\n}\n`)
}
writeFileSync(domainBulkPath, domainBulk)

// README
const readmePath = join(root, 'README.md')
let readme = readFileSync(readmePath, 'utf8')
for (const m of [...patchMeta].reverse()) {
  const block = `Current \`${m.version}\` behavior:

- Production ${m.name} rollout readiness validates ${m.name} coverage and readiness through \`GET /api/${m.name}/readiness\`.
- Workspace owners and admins can inspect workspace ${m.name} metrics from \`GET /api/${m.name}/workspace/:workspaceId/admin\`.
- The web billing panel shows ${m.name} rollout checks and workspace ${m.name} admin tools.

`
  if (!readme.includes(`Current \`${m.version}\``)) {
    readme = readme.replace(
      'Current `v5.595` behavior:',
      `${block}Current \`v5.595\` behavior:`,
    )
  }
}
writeFileSync(readmePath, readme)

console.log('Patched shared files for v5.596-v5.600 rollout milestones.')
