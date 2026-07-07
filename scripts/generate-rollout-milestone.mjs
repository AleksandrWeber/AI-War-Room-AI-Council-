#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { milestones } from './milestones-v1056-v1060.mjs'

const root = join(import.meta.dirname, '..')

// Legacy batch configs remain in git history; this script generates the active batch.

function validateMilestones(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error('Milestones input is empty; generation aborted.')
  }

  const names = new Set()
  for (const m of input) {
    if (!m?.name || !m?.Name || !m?.action || !m?.version) {
      throw new Error(`Invalid milestone entry: ${JSON.stringify(m)}`)
    }
    if (names.has(m.name)) {
      throw new Error(`Duplicate milestone name detected: ${m.name}`)
    }
    names.add(m.name)
  }
}

function rolloutSchema(m) {
  return `import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ${m.name}RolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ${m.Name}RolloutCheckStatus = z.infer<
  typeof ${m.name}RolloutCheckStatusSchema
>

export const ${m.name}RolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ${m.name}RolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ${m.Name}RolloutCheck = z.infer<typeof ${m.name}RolloutCheckSchema>

export const ${m.name}RolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ${m.Name}RolloutStatus = z.infer<typeof ${m.name}RolloutStatusSchema>

export const ${m.name}CapabilitiesResponseSchema = z.object({
  supports${m.Name}Rollout: z.literal(true),
  supports${m.Name}AdminTools: z.literal(true),
  ${m.cap1}: z.literal(true),
  ${m.cap2}: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ${m.Name}CapabilitiesResponse = z.infer<
  typeof ${m.name}CapabilitiesResponseSchema
>

export const ${m.name}RolloutResponseSchema = z.object({
  status: ${m.name}RolloutStatusSchema,
  checks: z.array(${m.name}RolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ${m.Name}RolloutResponse = z.infer<
  typeof ${m.name}RolloutResponseSchema
>

export function get${m.Name}RolloutGuidance() {
  return '${m.guidance}'
}
`
}

function adminSchema(m) {
  const domains = m.domains.map((d) => `'${d.domain}'`).join(',\n  ')
  return `import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ${m.name}AdminDomainSchema = z.enum([
  ${domains},
])
export type ${m.Name}AdminDomain = z.infer<typeof ${m.name}AdminDomainSchema>

export const ${m.name}AdminRecordSchema = z.object({
  domain: ${m.name}AdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ${m.Name}AdminRecord = z.infer<typeof ${m.name}AdminRecordSchema>

export const ${m.name}AdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ${m.percent}: z.number().min(0).max(100),
})
export type ${m.Name}AdminStats = z.infer<typeof ${m.name}AdminStatsSchema>

export const ${m.name}AdminActionSchema = z.enum(['${m.action}'])
export type ${m.Name}AdminAction = z.infer<typeof ${m.name}AdminActionSchema>

export const ${m.name}AdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(${m.name}AdminRecordSchema),
  stats: ${m.name}AdminStatsSchema,
  availableActions: z.array(${m.name}AdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ${m.Name}AdminSummaryResponse = z.infer<
  typeof ${m.name}AdminSummaryResponseSchema
>

export const ${m.name}AdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ${m.name}AdminActionSchema,
})
export type ${m.Name}AdminActionRequest = z.infer<
  typeof ${m.name}AdminActionRequestSchema
>

export const ${m.name}AdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ${m.name}AdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ${m.name}AdminStatsSchema.optional(),
})
export type ${m.Name}AdminActionResponse = z.infer<
  typeof ${m.name}AdminActionResponseSchema
>
`
}

function rolloutHelpers(m) {
  const tableConst = m.tables.map((t) => `'${t}'`).join(',\n  ')
  const countKey = `existing${m.Name}TableCount`
  const tableCoverage = `${m.name}TableCoverageComplete`
  return `import type { ApiEnv } from '../config/env.js'

export const CRITICAL_${m.name.toUpperCase()}_TABLES = [
  ${tableConst},
] as const

export type ${m.Name}RolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ${m.Name}RolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ${m.Name}RolloutCheck[]
  guidance: string
}

export type ${m.Name}RolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  ${countKey}: number
  ${m.check1.key}: boolean
  ${m.check2.key}: boolean
  ${m.check3Key}: boolean
}

export function evaluate${m.Name}Rollout(
  input: ${m.Name}RolloutInput,
): ${m.Name}RolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ${tableCoverage} =
    input.${countKey} === CRITICAL_${m.name.toUpperCase()}_TABLES.length

  const checks: ${m.Name}RolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ${m.name} checks can reach the database.'
            : 'Production ${m.name} rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: '${m.name}_signal_table_coverage',
      label: '${m.Name} signal table coverage',
      status: ${tableCoverage} || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? '${m.Name} signal table coverage is only enforced in production.'
          : ${tableCoverage}
            ? \`\${input.${countKey}}/\${CRITICAL_${m.name.toUpperCase()}_TABLES.length} ${m.name} signal tables are present.\`
            : \`\${input.${countKey}}/\${CRITICAL_${m.name.toUpperCase()}_TABLES.length} ${m.name} signal tables were found.\`,
    },
    {
      name: '${m.check1.name}',
      label: '${m.check1.label}',
      status: input.${m.check1.key} || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? '${m.check1.label} is only enforced in production.'
          : input.${m.check1.key}
            ? '${m.check1.table} table is available for ${m.check1.label.toLowerCase()} signals.'
            : 'Production ${m.name} rollout requires a ${m.check1.table} table.',
    },
    {
      name: '${m.check2.name}',
      label: '${m.check2.label}',
      status: input.${m.check2.key} || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? '${m.check2.label} is only enforced in production.'
          : input.${m.check2.key}
            ? '${m.check2.table} table is available for ${m.check2.label.toLowerCase()} signals.'
            : 'Production ${m.name} rollout requires a ${m.check2.table} table.',
    },
    {
      name: '${m.readiness}',
      label: '${m.readinessLabel}',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ${tableCoverage} &&
          input.${m.check1.key} &&
          input.${m.check2.key} &&
          input.${m.check3Key})
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? '${m.readinessLabel} is only enforced in production.'
          : input.postgresConnectivity &&
              ${tableCoverage} &&
              input.${m.check1.key} &&
              input.${m.check2.key} &&
              input.${m.check3Key}
            ? '${m.readinessDetail}'
            : 'Production ${m.name} rollout requires PostgreSQL connectivity, ${m.name} tables, ${m.check1.label.toLowerCase()}, ${m.check2.label.toLowerCase()}, and full signal coverage.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Production ${m.name} rollout checks passed. ${m.Name} coverage and ${m.readinessLabel.toLowerCase()} signals are healthy.'
        : 'Production ${m.name} rollout is not ready. Resolve failed checks before relying on production ${m.name} tooling.',
  }
}
`
}

function adminHelpers(m) {
  return `import type {
  ${m.Name}AdminAction,
  ${m.Name}AdminRecord,
  ${m.Name}AdminStats,
} from '@ai-war-room/schemas'

export type Workspace${m.Name}DomainInventory = {
  domain: ${m.Name}AdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function build${m.Name}AdminRecords(
  inventory: Workspace${m.Name}DomainInventory[],
): ${m.Name}AdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function build${m.Name}AdminStats(input: {
  records: ${m.Name}AdminRecord[]
  postgresConnectivity: boolean
}): ${m.Name}AdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === '${m.metricDomain}')
      ?.recordCount ?? 0
  const ${m.percent} =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((metricRecords / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    ${m.percent},
  }
}

export function get${m.Name}AdminGuidance(input: {
  stats: ${m.Name}AdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ${m.name} metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ${m.name} coverage and refresh the ${m.name} summary.'
  }

  if (input.stats.${m.percent} < 95) {
    return 'Workspace owners and admins can inspect ${m.metricDetail} below the 95% target and refresh the ${m.name} summary.'
  }

  return 'Workspace owners and admins can inspect workspace ${m.name} coverage and refresh the ${m.name} summary.'
}

export function resolve${m.Name}AdminActions(): ${m.Name}AdminAction[] {
  return ['${m.action}']
}
`
}

function statusService(m) {
  const uniqueCoverageKeys = m.tables
    .map((table) => `${m.coverageKeys[table]}: existingTables.has('${table}'),`)
    .join('\n      ')

  const domainBlocks = m.domains
    .map((d) => {
      const params = d.params === false ? '[]' : '[workspaceId]'
      const workspaceParam = d.params === false ? '_workspaceId' : 'workspaceId'
      return `  {
    domain: '${d.domain}',
    tableName: '${d.tableName}',
    requiredTables: [${d.requiredTables.map((t) => `'${t}'`).join(', ')}],
    countQuery: (${workspaceParam}) => ({
      sql: \`
        ${d.sql}
      \`,
      params: ${params},
    }),
  },`
    })
    .join('\n')

  return `import { Injectable } from '@nestjs/common'
import type { ${m.Name}AdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_${m.name.toUpperCase()}_TABLES } from './${m.name}-rollout.helpers.js'

const WORKSPACE_${m.name.toUpperCase()}_DOMAINS: Array<{
  domain: ${m.Name}AdminDomain
  tableName: string
  requiredTables: string[]
  countQuery: (workspaceId: string) => { sql: string; params: string[] }
}> = [
${domainBlocks}
]

@Injectable()
export class ${m.Name}StatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async get${m.Name}TableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_${m.name.toUpperCase()}_TABLES,
    )

    return {
      existing${m.Name}TableCount: existingTables.size,
      existingTables,
      ${uniqueCoverageKeys}
    }
  }

  async getWorkspace${m.Name}Inventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_${m.name.toUpperCase()}_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_${m.name.toUpperCase()}_DOMAINS.map(async (entry) => {
        const tableExists = entry.requiredTables.every((tableName) =>
          existingTables.has(tableName),
        )

        if (!tableExists) {
          return {
            domain: entry.domain,
            tableName: entry.tableName,
            recordCount: 0,
            tableExists: false,
          }
        }

        const recordCount = await this.countWithQuery(
          entry.countQuery(workspaceId),
        )

        return {
          domain: entry.domain,
          tableName: entry.tableName,
          recordCount,
          tableExists: true,
        }
      }),
    )
  }

  private async listExistingTables(tableNames: readonly string[]) {
    if (tableNames.length === 0) {
      return new Set<string>()
    }

    try {
      const result = await this.postgresService.query<{ table_name: string }>(
        \`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = ANY($1::text[])
        \`,
        [tableNames],
      )

      return new Set(result.rows.map((row) => row.table_name))
    } catch {
      return new Set<string>()
    }
  }

  private async countWithQuery(input: { sql: string; params: string[] }) {
    try {
      const result = await this.postgresService.query<{ count: string }>(
        input.sql,
        input.params,
      )

      return Number.parseInt(result.rows[0]?.count ?? '0', 10)
    } catch {
      return 0
    }
  }
}
`
}

function adminService(m) {
  const coverageInput = [
    `${m.check1.key}: ${m.name}TableCoverage.${m.check1.key},`,
    `${m.check2.key}: ${m.name}TableCoverage.${m.check2.key},`,
    `${m.check3Key}: ${m.name}TableCoverage.${m.check3Key},`,
  ].join('\n      ')

  return `import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  get${m.Name}RolloutGuidance,
  ${m.name}AdminActionRequestSchema,
  ${m.name}AdminActionResponseSchema,
  ${m.name}AdminSummaryResponseSchema,
  ${m.name}CapabilitiesResponseSchema,
  ${m.name}RolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  build${m.Name}AdminRecords,
  build${m.Name}AdminStats,
  get${m.Name}AdminGuidance,
  resolve${m.Name}AdminActions,
} from './${m.name}-admin.helpers.js'
import { evaluate${m.Name}Rollout } from './${m.name}-rollout.helpers.js'
import { ${m.Name}StatusService } from './${m.name}-status.service.js'

@Injectable()
export class ${m.Name}AdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ${m.name}StatusService: ${m.Name}StatusService,
  ) {}

  getCapabilities() {
    return ${m.name}CapabilitiesResponseSchema.parse({
      supports${m.Name}Rollout: true,
      supports${m.Name}AdminTools: true,
      ${m.cap1}: true,
      ${m.cap2}: true,
      guidance: get${m.Name}RolloutGuidance(),
    })
  }

  async get${m.Name}Rollout() {
    const ${m.name}TableCoverage =
      await this.${m.name}StatusService.get${m.Name}TableCoverage()

    const rollout = evaluate${m.Name}Rollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.${m.name}StatusService.pingPostgres(),
      existing${m.Name}TableCount: ${m.name}TableCoverage.existing${m.Name}TableCount,
      ${coverageInput}
    })

    return ${m.name}RolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspace${m.Name}AdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManage${m.Name}(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.${m.name}StatusService.getWorkspace${m.Name}Inventory(
        workspaceId,
      )
    const records = build${m.Name}AdminRecords(inventoryItems)
    const postgresConnectivity = await this.${m.name}StatusService.pingPostgres()
    const stats = build${m.Name}AdminStats({
      records,
      postgresConnectivity,
    })

    return ${m.name}AdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolve${m.Name}AdminActions(),
      guidance: get${m.Name}AdminGuidance({ stats }),
    })
  }

  async execute${m.Name}AdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: '${m.action}'
    },
  ) {
    this.assertCanManage${m.Name}(authContext)

    const payload = ${m.name}AdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case '${m.action}': {
        const summary = await this.getWorkspace${m.Name}AdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ${m.name}AdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: \`Refreshed ${m.name} summary with \${summary.stats.${m.percent}}% ${m.metricDetail} across \${summary.stats.coveredDomains}/\${summary.stats.totalDomains} domain(s).\`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManage${m.Name}(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ${m.name} tools.',
    })
  }
}
`
}

function controller(m) {
  return `import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { ${m.Name}AdminService } from './${m.name}-admin.service.js'

type ${m.Name}AdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('${m.name}')
export class ${m.Name}Controller {
  constructor(
    private readonly ${m.name}AdminService: ${m.Name}AdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.${m.name}AdminService.getCapabilities()
  }

  @Get('readiness')
  async get${m.Name}Rollout() {
    return this.${m.name}AdminService.get${m.Name}Rollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspace${m.Name}AdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.${m.name}AdminService.getWorkspace${m.Name}AdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async execute${m.Name}AdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ${m.Name}AdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== '${m.action}') {
      throw new BadRequestException({
        message: 'Unsupported ${m.name} admin action.',
      })
    }

    return this.${m.name}AdminService.execute${m.Name}AdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
`
}

function moduleFile(m) {
  return `import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ${m.Name}AdminService } from './${m.name}-admin.service.js'
import { ${m.Name}Controller } from './${m.name}.controller.js'
import { ${m.Name}StatusService } from './${m.name}-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [${m.Name}Controller],
  providers: [${m.Name}StatusService, ${m.Name}AdminService],
  exports: [${m.Name}AdminService],
})
export class ${m.Name}Module {}
`
}

function webUi(m) {
  const domainCases = Object.entries(m.domainLabels)
    .map(
      ([domain, label]) => `    case '${domain}':
      return '${label}'`,
    )
    .join('\n')

  const cap1Test = m.cap1.replace('supports', '').replace('Signals', '')
  const cap1Camel =
    cap1Test[0].toLowerCase() +
    cap1Test
      .slice(1)
      .replace(/([A-Z])/g, (m) => m)

  return `import {
  ${m.name}AdminActionResponseSchema,
  ${m.name}AdminSummaryResponseSchema,
  ${m.name}CapabilitiesResponseSchema,
  ${m.name}RolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetch${m.Name}Rollout(apiBaseUrl: string) {
  const response = await fetch(\`\${apiBaseUrl}/${m.name}/readiness\`)

  if (!response.ok) {
    throw new Error(\`API returned \${response.status}\`)
  }

  return ${m.name}RolloutResponseSchema.parse(await response.json())
}

export async function fetch${m.Name}AdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    \`\${apiBaseUrl}/${m.name}/workspace/\${encodeURIComponent(workspaceId)}/admin\`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(\`API returned \${response.status}\`)
  }

  return ${m.name}AdminSummaryResponseSchema.parse(await response.json())
}

export async function execute${m.Name}AdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: '${m.action}' },
) {
  const response = await fetch(
    \`\${apiBaseUrl}/${m.name}/workspace/\${encodeURIComponent(workspaceId)}/admin/actions\`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        ...input,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(\`API returned \${response.status}\`)
  }

  return ${m.name}AdminActionResponseSchema.parse(await response.json())
}

export function format${m.Name}RolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function format${m.Name}RolloutCheckStatus(
  status: 'pass' | 'fail' | 'skip',
) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}

export function format${m.Name}AdminAction(action: '${m.action}') {
  switch (action) {
    case '${m.action}':
      return 'Refresh ${m.name} summary'
  }
}

export function format${m.Name}Domain(
  domain: ${Object.keys(m.domainLabels)
    .map((d) => `'${d}'`)
    .join(' | ')},
) {
  switch (domain) {
${domainCases}
  }
}

export async function fetch${m.Name}Capabilities(apiBaseUrl: string) {
  const response = await fetch(\`\${apiBaseUrl}/${m.name}/capabilities\`)

  if (!response.ok) {
    throw new Error(\`API returned \${response.status}\`)
  }

  return ${m.name}CapabilitiesResponseSchema.parse(await response.json())
}
`
}

function integrationTest(m) {
  return `
describe('${m.name} rollout integration', () => {
  it('reports ${m.name} capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/${m.name}/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supports${m.Name}Rollout: true,
      supports${m.Name}AdminTools: true,
      ${m.cap1}: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/${m.name}/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ${m.name} admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/${m.name}/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ${m.percent}: expect.any(Number),
      },
    })
  })

  it('rejects ${m.name} admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/${m.name}/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
`
}

validateMilestones(milestones)

for (const m of milestones) {
  writeFileSync(
    join(root, 'packages/schemas/src', `${m.name}-rollout.ts`),
    rolloutSchema(m),
  )
  writeFileSync(
    join(root, 'packages/schemas/src', `${m.name}-admin.ts`),
    adminSchema(m),
  )

  const apiDir = join(root, 'apps/api/src', m.name)
  mkdirSync(apiDir, { recursive: true })
  writeFileSync(join(apiDir, `${m.name}-rollout.helpers.ts`), rolloutHelpers(m))
  writeFileSync(join(apiDir, `${m.name}-admin.helpers.ts`), adminHelpers(m))
  writeFileSync(join(apiDir, `${m.name}-status.service.ts`), statusService(m))
  writeFileSync(join(apiDir, `${m.name}-admin.service.ts`), adminService(m))
  writeFileSync(join(apiDir, `${m.name}.controller.ts`), controller(m))
  writeFileSync(join(apiDir, `${m.name}.module.ts`), moduleFile(m))

  writeFileSync(join(root, 'apps/web/src', `${m.name}-ui.ts`), webUi(m))
}

writeFileSync(
  join(root, 'scripts/generated-integration-tests.txt'),
  milestones.map(integrationTest).join('\n'),
)

console.log(`Generated ${milestones.length} rollout milestones.`)
