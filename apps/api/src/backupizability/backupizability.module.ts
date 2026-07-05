import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BackupizabilityAdminService } from './backupizability-admin.service.js'
import { BackupizabilityController } from './backupizability.controller.js'
import { BackupizabilityStatusService } from './backupizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BackupizabilityController],
  providers: [BackupizabilityStatusService, BackupizabilityAdminService],
  exports: [BackupizabilityAdminService],
})
export class BackupizabilityModule {}
