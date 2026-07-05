import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AxiologizabilityAdminService } from './axiologizability-admin.service.js'
import { AxiologizabilityController } from './axiologizability.controller.js'
import { AxiologizabilityStatusService } from './axiologizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AxiologizabilityController],
  providers: [AxiologizabilityStatusService, AxiologizabilityAdminService],
  exports: [AxiologizabilityAdminService],
})
export class AxiologizabilityModule {}
