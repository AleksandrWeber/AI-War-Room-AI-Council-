import { Module, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'
import { PostgresWorkspaceRepository } from './postgres-workspace.repository.js'
import { UserProvisioningService } from './user-provisioning.service.js'
import { WorkspaceAdminService } from './workspace-admin.service.js'
import { WorkspacesController } from './workspaces.controller.js'
import { WorkspaceService } from './workspace.service.js'
import { WORKSPACE_REPOSITORY } from './workspace.repository.js'

@Module({
  imports: [PersistenceModule, forwardRef(() => AuthModule)],
  controllers: [WorkspacesController],
  providers: [
    PostgresWorkspaceRepository,
    WorkspaceService,
    WorkspaceAdminService,
    UserProvisioningService,
    {
      provide: WORKSPACE_REPOSITORY,
      inject: [ConfigService, PostgresWorkspaceRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresWorkspaceRepository: PostgresWorkspaceRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryWorkspaceRepository()
          : postgresWorkspaceRepository
      },
    },
  ],
  exports: [WorkspaceService, UserProvisioningService, WorkspaceAdminService],
})
export class WorkspacesModule {}
