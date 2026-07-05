#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')

const milestones = [
  {
    name: 'attestation',
    Name: 'Attestation',
    percent: 'attestationPercent',
    metricLabel: 'Provider credential attestation',
    action: 'refresh_attestation_summary',
    signalsHint: 'Run outcomes, provider credentials, and model registry entries',
    domainFormatter: 'formatAttestationDomain',
  },
  {
    name: 'authenticity',
    Name: 'Authenticity',
    percent: 'authenticityPercent',
    metricLabel: 'Moderator synthesis authenticity',
    action: 'refresh_authenticity_summary',
    signalsHint: 'Run outcomes, moderator syntheses, and artifacts',
    domainFormatter: 'formatAuthenticityDomain',
  },
  {
    name: 'provenance',
    Name: 'Provenance',
    percent: 'provenancePercent',
    metricLabel: 'Usage provenance',
    action: 'refresh_provenance_summary',
    signalsHint: 'Run outcomes, usage events, and artifacts',
    domainFormatter: 'formatProvenanceDomain',
  },
  {
    name: 'verifiability',
    Name: 'Verifiability',
    percent: 'verifiabilityPercent',
    metricLabel: 'Billing invoice verifiability',
    action: 'refresh_verifiability_summary',
    signalsHint: 'Run outcomes, billing invoices, and webhook events',
    domainFormatter: 'formatVerifiabilityDomain',
  },
  {
    name: 'confirmability',
    Name: 'Confirmability',
    percent: 'confirmabilityPercent',
    metricLabel: 'Billing notification confirmability',
    action: 'refresh_confirmability_summary',
    signalsHint: 'Run outcomes, billing notifications, and usage limits',
    domainFormatter: 'formatConfirmabilityDomain',
  },
]

// index.ts
const indexPath = join(root, 'packages/schemas/src/index.ts')
let index = readFileSync(indexPath, 'utf8')
const exportBlock = milestones
  .map(
    (m) =>
      `export * from './${m.name}-rollout.js'\nexport * from './${m.name}-admin.js'`,
  )
  .join('\n')
if (!index.includes('attestation-rollout')) {
  index = index.replace(
    "export * from './transparency-admin.js'",
    `export * from './transparency-admin.js'\n${exportBlock}`,
  )
}
writeFileSync(indexPath, index)

// app.module.ts
const appModulePath = join(root, 'apps/api/src/app.module.ts')
let appModule = readFileSync(appModulePath, 'utf8')
if (!appModule.includes('AttestationModule')) {
  const importBlock = milestones
    .map(
      (m) =>
        `import { ${m.Name}Module } from './${m.name}/${m.name}.module.js'`,
    )
    .join('\n')
  const moduleBlock = milestones.map((m) => `    ${m.Name}Module,`).join('\n')
  appModule = appModule.replace(
    "import { TransparencyModule } from './transparency/transparency.module.js'",
    `import { TransparencyModule } from './transparency/transparency.module.js'\n${importBlock}`,
  )
  appModule = appModule.replace(
    '    TransparencyModule,',
    `    TransparencyModule,\n${moduleBlock}`,
  )
}
writeFileSync(appModulePath, appModule)

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
if (!tests.includes("describe('attestation rollout integration'")) {
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

for (const m of milestones) {
  if (app.includes(`${m.name}Rollout`)) continue

  const prev = milestones[milestones.indexOf(m) - 1]
  const rolloutAnchor = prev
    ? `  const [${prev.name}Rollout, set${prev.Name}Rollout]`
    : '  const [transparencyRollout, setTransparencyRollout]'
  const adminSummaryAnchor = prev
    ? `  const [${prev.name}AdminSummary, set${prev.Name}AdminSummary]`
    : '  const [transparencyAdminSummary, setTransparencyAdminSummary]'
  const adminActionAnchor = prev
    ? `  const [${prev.name}AdminAction, set${prev.Name}AdminAction]`
    : '  const [transparencyAdminAction, setTransparencyAdminAction]'
  const fetchAnchor = prev
    ? `    fetch${prev.Name}Rollout(apiBaseUrl)`
    : '    fetchTransparencyRollout(apiBaseUrl)'
  const billingAnchor = prev
    ? `      set${prev.Name}AdminSummary(${prev.name}Admin)`
    : '      setTransparencyAdminSummary(transparencyAdmin)'
  const handlerAnchor = prev
    ? `  async function handle${prev.Name}AdminAction(`
    : `  async function handleExportRunHistory(format: 'csv' | 'json') {`
  const rolloutUiAnchor = prev
    ? `{${prev.name}Rollout ? (`
    : `{billingCapabilities?.supportsBillingRollout && billingRollout ? (`
  const adminUiAnchor = prev
    ? `{${prev.name}AdminSummary ? (`
    : `{memberAdminSummary ? (`

  // schema types
  app = app.replace(
    '  TransparencyAdminSummaryResponse,\n  RunCapabilitiesResponse,',
    `  TransparencyAdminSummaryResponse,\n  ${m.Name}RolloutResponse,\n  ${m.Name}AdminSummaryResponse,\n  RunCapabilitiesResponse,`,
  )

  // ui imports
  app = app.replace(
    "} from './transparency-ui'\nimport {\n  buildBootstrapAuthHeaders,",
    `} from './transparency-ui'\nimport {\n  execute${m.Name}AdminAction,\n  fetch${m.Name}AdminSummary,\n  fetch${m.Name}Rollout,\n  format${m.Name}AdminAction,\n  ${m.domainFormatter},\n  format${m.Name}RolloutCheckStatus,\n  format${m.Name}RolloutStatus,\n} from './${m.name}-ui'\nimport {\n  buildBootstrapAuthHeaders,`,
  )

  // rollout state
  app = app.replace(
    `${rolloutAnchor}`,
    `${rolloutAnchor}\n  const [${m.name}Rollout, set${m.Name}Rollout] =\n    useState<${m.Name}RolloutResponse | null>(null)`,
  )

  // admin state
  app = app.replace(
    `${adminSummaryAnchor}`,
    `${adminSummaryAnchor}\n  const [${m.name}AdminSummary, set${m.Name}AdminSummary] =\n    useState<${m.Name}AdminSummaryResponse | null>(null)`,
  )

  // admin action state
  app = app.replace(
    `${adminActionAnchor}`,
    `${adminActionAnchor}\n  const [${m.name}AdminAction, set${m.Name}AdminAction] = useState<\n    'idle' | 'running'\n  >('idle')`,
  )

  // useEffect fetch - insert after previous milestone fetch block
  if (prev) {
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
  } else {
    app = app.replace(
      `    fetchTransparencyRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setTransparencyRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTransparencyRollout(null)
        }
      })

    fetchUsageCapabilities(apiBaseUrl)`,
      `    fetchTransparencyRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setTransparencyRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTransparencyRollout(null)
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
  }

  // billing load
  app = app.replace(
    `${billingAnchor}`,
    `${billingAnchor}

      const ${m.name}Admin = await fetch${m.Name}AdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      set${m.Name}AdminSummary(${m.name}Admin)`,
  )

  // handler - insert before previous handler or export
  if (prev) {
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
  } else {
    app = app.replace(
      `  async function handleExportRunHistory(format: 'csv' | 'json') {`,
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

  async function handleExportRunHistory(format: 'csv' | 'json') {`,
    )
  }

  // rollout UI
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

  // admin UI
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
for (const m of [...milestones].reverse()) {
  const version = {
    attestation: 'v5.61',
    authenticity: 'v5.62',
    provenance: 'v5.63',
    verifiability: 'v5.64',
    confirmability: 'v5.65',
  }[m.name]
  const block = `Current \`${version}\` behavior:

- Production ${m.name} rollout readiness validates ${m.name} coverage and readiness through \`GET /api/${m.name}/readiness\`.
- Workspace owners and admins can inspect workspace ${m.name} metrics from \`GET /api/${m.name}/workspace/:workspaceId/admin\`.
- The web billing panel shows ${m.name} rollout checks and workspace ${m.name} admin tools.

`
  if (!readme.includes(`Current \`${version}\``)) {
    readme = readme.replace('Current `v5.60` behavior:', `${block}Current \`v5.60\` behavior:`)
  }
}
writeFileSync(readmePath, readme)

console.log('Patched shared files for rollout milestones.')
