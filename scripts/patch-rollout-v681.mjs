#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { milestones, patchMeta } from './milestones-v681-v685.mjs'

const root = join(import.meta.dirname, '..')
const BASE = {
  name: 'materializability',
  Name: 'Materializability',
}

// index.ts
const indexPath = join(root, 'packages/schemas/src/index.ts')
let index = readFileSync(indexPath, 'utf8')
const exportBlock = milestones
  .map(
    (m) =>
      `export * from './${m.name}-rollout.js'\nexport * from './${m.name}-admin.js'`,
  )
  .join('\n')
if (!index.includes('iconizability-rollout')) {
  index = index.replace(
    "export * from './materializability-admin.js'",
    `export * from './materializability-admin.js'\n${exportBlock}`,
  )
  writeFileSync(indexPath, index)
}

// app.module.ts
const appModulePath = join(root, 'apps/api/src/app.module.ts')
let appModule = readFileSync(appModulePath, 'utf8')
if (!appModule.includes('IconizabilityModule')) {
  const importBlock = milestones
    .map(
      (m) =>
        `import { ${m.Name}Module } from './${m.name}/${m.name}.module.js'`,
    )
    .join('\n')
  const moduleBlock = milestones.map((m) => `    ${m.Name}Module,`).join('\n')
  appModule = appModule.replace(
    "import { MaterializabilityModule } from './materializability/materializability.module.js'",
    `import { MaterializabilityModule } from './materializability/materializability.module.js'\n${importBlock}`,
  )
  appModule = appModule.replace(
    '    MaterializabilityModule,',
    `    MaterializabilityModule,\n${moduleBlock}`,
  )
  writeFileSync(appModulePath, appModule)
}

// integration tests
const testPath = join(
  root,
  'apps/api/src/workspaces/workspace-admin.integration.test.ts',
)
let tests = readFileSync(testPath, 'utf8')
const generatedTests = readFileSync(
  join(root, 'scripts/generated-integration-tests.txt'),
  'utf8',
)
if (!tests.includes("describe('iconizability rollout integration'")) {
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

// App.tsx
const appPath = join(root, 'apps/web/src/App.tsx')
let app = readFileSync(appPath, 'utf8')

if (!app.includes('IconizabilityRolloutResponse')) {
  const typeBlock = patchMeta
    .map(
      (m) =>
        `  ${m.Name}RolloutResponse,\n  ${m.Name}AdminSummaryResponse,`,
    )
    .join('\n')

  app = app.replace(
    '  MaterializabilityAdminSummaryResponse,\n  RunCapabilitiesResponse,',
    `  MaterializabilityAdminSummaryResponse,\n${typeBlock}\n  RunCapabilitiesResponse,`,
  )

  const importBlock = patchMeta
    .map(
      (m) => `import {
  execute${m.Name}AdminAction,
  fetch${m.Name}AdminSummary,
  fetch${m.Name}Rollout,
  format${m.Name}AdminAction,
  ${m.domainFormatter},
  format${m.Name}RolloutCheckStatus,
  format${m.Name}RolloutStatus,
} from './${m.name}-ui'`,
    )
    .join('\n')

  app = app.replace(
    "} from './materializability-ui'\nimport {\n  buildBootstrapAuthHeaders,",
    `} from './materializability-ui'\n${importBlock}\nimport {\n  buildBootstrapAuthHeaders,`,
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
    `    fetch${prev.Name}Rollout(apiBaseUrl)
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
    `    fetch${prev.Name}Rollout(apiBaseUrl)
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

    fetch${m.Name}Rollout(apiBaseUrl)
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

      const ${m.name}Admin = await fetch${m.Name}AdminSummary(
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
      const result = await execute${m.Name}AdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetch${m.Name}Rollout(apiBaseUrl)
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

  const rolloutUiAnchor =
    prev.name === BASE.name
      ? `{billingCapabilities?.supportsBillingRollout && billingRollout ? (`
      : `{${prev.name}Rollout ? (`

  app = app.replace(
    rolloutUiAnchor,
    `{${m.name}Rollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production ${m.name} rollout readiness</span>
              <strong
                className={\`billing-rollout__status billing-rollout__status--\${${m.name}Rollout.status}\`}
              >
                {format${m.Name}RolloutStatus(${m.name}Rollout.status)}
              </strong>
            </div>
            <p>{${m.name}Rollout.guidance}</p>
            <div className="billing-rollout__checks">
              {${m.name}Rollout.checks.map((check) => (
                <article
                  className={\`billing-rollout-check billing-rollout-check--\${check.status}\`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {format${m.Name}RolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {${m.name}Rollout.checkedAt}</small>
          </div>
        ) : null}

        ${rolloutUiAnchor}`,
  )

  const adminUiAnchor =
    prev.name === BASE.name
      ? `{memberAdminSummary ? (`
      : `{${prev.name}AdminSummary ? (`

  app = app.replace(
    adminUiAnchor,
    `{${m.name}AdminSummary ? (
          <div className="billing-admin workspace-${m.name}-admin">
            <div className="billing-admin__header">
              <span>${m.Name} admin</span>
              <strong>{${m.name}AdminSummary.role}</strong>
            </div>
            <p>{${m.name}AdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>${m.metricLabel}</span>
                <strong>
                  {${m.name}AdminSummary.stats.${m.percent}}%
                </strong>
                <small>
                  {${m.name}AdminSummary.stats.coveredDomains}/
                  {${m.name}AdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>${m.Name} signals</span>
                <strong>{${m.name}AdminSummary.stats.totalRecords}</strong>
                <small>
                  {${m.name}AdminSummary.stats.postgresConnectivity
                    ? '${m.signalsHint}'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-${m.name}-list">
              {${m.name}AdminSummary.records.map((record) => (
                <article
                  className={\`workspace-${m.name}-card workspace-${m.name}-card--\${record.tableExists ? 'ready' : 'missing'}\`}
                  key={record.domain}
                >
                  <div>
                    <strong>{${m.domainFormatter}(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? \`\${record.recordCount} record(s)\`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {${m.name}AdminSummary.availableActions.includes(
              '${m.action}',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={${m.name}AdminAction !== 'idle'}
                onClick={() =>
                  void handle${m.Name}AdminAction(
                    '${m.action}',
                  )
                }
              >
                {format${m.Name}AdminAction('${m.action}')}
              </button>
            ) : null}
          </div>
        ) : null}

        ${adminUiAnchor}`,
  )
}

writeFileSync(appPath, app)

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
      'Current `v5.180` behavior:',
      `${block}Current \`v5.180\` behavior:`,
    )
  }
}
writeFileSync(readmePath, readme)

console.log('Patched shared files for v5.181-v5.185 rollout milestones.')
