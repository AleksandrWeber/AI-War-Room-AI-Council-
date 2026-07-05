import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMigrationRolloutGuidance,
  migrationAdminActionRequestSchema,
  migrationAdminActionResponseSchema,
  migrationAdminSummaryResponseSchema,
  migrationCapabilitiesResponseSchema,
  migrationRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMigrationAdminRecords,
  buildMigrationAdminStats,
  getMigrationAdminGuidance,
  resolveMigrationAdminActions,
} from './migration-admin.helpers.js'
import { evaluateMigrationRollout } from './migration-rollout.helpers.js'
import { MigrationStatusService } from './migration-status.service.js'

@Injectable()
export class MigrationAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly migrationStatusService: MigrationStatusService,
  ) {}

  getCapabilities() {
    return migrationCapabilitiesResponseSchema.parse({
      supportsMigrationRollout: true,
      supportsMigrationAdminTools: true,
      supportsSchemaMigrationsTable: true,
      guidance: getMigrationRolloutGuidance(),
    })
  }

  async getMigrationRollout() {
    const inventory = await this.migrationStatusService.getMigrationInventory()
    const rollout = evaluateMigrationRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      schemaMigrationsTableExists: inventory.schemaMigrationsTableExists,
      postgresConnectivity: await this.migrationStatusService.pingPostgres(),
      availableMigrationCount: inventory.availableVersions.length,
      pendingMigrationCount: inventory.pendingVersions.length,
    })

    return migrationRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMigrationAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMigrations(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory = await this.migrationStatusService.getMigrationInventory()
    const records = buildMigrationAdminRecords(inventory)
    const stats = buildMigrationAdminStats(inventory)

    return migrationAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records: records.slice(-20).reverse(),
      stats,
      availableActions: resolveMigrationAdminActions(),
      guidance: getMigrationAdminGuidance({ stats }),
    })
  }

  async executeMigrationAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_migration_summary'
    },
  ) {
    this.assertCanManageMigrations(authContext)

    const payload = migrationAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_migration_summary': {
        const summary = await this.getWorkspaceMigrationAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return migrationAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed migration summary with ${summary.stats.appliedCount}/${summary.stats.totalMigrations} applied migration(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMigrations(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage database migration tools.',
    })
  }
}
