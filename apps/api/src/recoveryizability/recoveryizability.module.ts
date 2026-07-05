import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RecoveryizabilityAdminService } from './recoveryizability-admin.service.js'
import { RecoveryizabilityController } from './recoveryizability.controller.js'
import { RecoveryizabilityStatusService } from './recoveryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RecoveryizabilityController],
  providers: [RecoveryizabilityStatusService, RecoveryizabilityAdminService],
  exports: [RecoveryizabilityAdminService],
})
export class RecoveryizabilityModule {}
