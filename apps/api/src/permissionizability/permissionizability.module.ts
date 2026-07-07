import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PermissionizabilityAdminService } from './permissionizability-admin.service.js'
import { PermissionizabilityController } from './permissionizability.controller.js'
import { PermissionizabilityStatusService } from './permissionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PermissionizabilityController],
  providers: [PermissionizabilityStatusService, PermissionizabilityAdminService],
  exports: [PermissionizabilityAdminService],
})
export class PermissionizabilityModule {}
