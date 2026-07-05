import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RollbackabilizabilityAdminService } from './rollbackabilizability-admin.service.js'
import { RollbackabilizabilityController } from './rollbackabilizability.controller.js'
import { RollbackabilizabilityStatusService } from './rollbackabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RollbackabilizabilityController],
  providers: [RollbackabilizabilityStatusService, RollbackabilizabilityAdminService],
  exports: [RollbackabilizabilityAdminService],
})
export class RollbackabilizabilityModule {}
