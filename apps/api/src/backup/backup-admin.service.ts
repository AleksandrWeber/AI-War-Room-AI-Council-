import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  backupAdminActionRequestSchema,
  backupAdminActionResponseSchema,
  backupAdminSummaryResponseSchema,
  backupCapabilitiesResponseSchema,
  backupRolloutResponseSchema,
  getBackupRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import {
  buildBackupAdminRecords,
  buildBackupAdminStats,
  getBackupAdminGuidance,
  resolveBackupAdminActions,
} from './backup-admin.helpers.js'
import { evaluateBackupRollout } from './backup-rollout.helpers.js'
import { BackupStatusService } from './backup-status.service.js'

@Injectable()
export class BackupAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly backupStatusService: BackupStatusService,
    private readonly migrationStatusService: MigrationStatusService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  getCapabilities() {
    return backupCapabilitiesResponseSchema.parse({
      supportsBackupRollout: true,
      supportsBackupAdminTools: true,
      supportsPostgresBackupCoverage: true,
      supportsRedisPersistenceChecks: true,
      guidance: getBackupRolloutGuidance(),
    })
  }

  async getBackupRollout() {
    const inventory = await this.migrationStatusService.getMigrationInventory()
    const criticalTableCoverage =
      await this.backupStatusService.getCriticalTableCoverage()
    const redisBackedPersistence =
      this.idempotencyService.usesRedisBackedReservation()
    const redisConnectivity = redisBackedPersistence
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateBackupRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.backupStatusService.pingPostgres(),
      redisBackedPersistence,
      redisConnectivity,
      existingCriticalTableCount:
        criticalTableCoverage.existingCriticalTableCount,
      pendingMigrationCount: inventory.pendingVersions.length,
    })

    return backupRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBackupAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBackup(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory =
      await this.backupStatusService.getWorkspaceBackupInventory(workspaceId)
    const records = buildBackupAdminRecords(inventory)
    const postgresConnectivity = await this.backupStatusService.pingPostgres()
    const redisBackedPersistence =
      this.idempotencyService.usesRedisBackedReservation()
    const stats = buildBackupAdminStats({
      records,
      postgresConnectivity,
      redisBackedPersistence,
    })

    return backupAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBackupAdminActions(),
      guidance: getBackupAdminGuidance({ stats }),
    })
  }

  async executeBackupAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_backup_summary'
    },
  ) {
    this.assertCanManageBackup(authContext)

    const payload = backupAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_backup_summary': {
        const summary = await this.getWorkspaceBackupAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return backupAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed backup summary with ${summary.stats.totalRecords} recoverable record(s) across ${summary.stats.recoverableDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBackup(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production backup tools.',
    })
  }
}
