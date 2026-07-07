import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReconciliationizabilityAdminService } from './reconciliationizability-admin.service.js'
import { ReconciliationizabilityController } from './reconciliationizability.controller.js'
import { ReconciliationizabilityStatusService } from './reconciliationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReconciliationizabilityController],
  providers: [ReconciliationizabilityStatusService, ReconciliationizabilityAdminService],
  exports: [ReconciliationizabilityAdminService],
})
export class ReconciliationizabilityModule {}
