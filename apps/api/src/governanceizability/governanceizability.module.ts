import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GovernanceizabilityAdminService } from './governanceizability-admin.service.js'
import { GovernanceizabilityController } from './governanceizability.controller.js'
import { GovernanceizabilityStatusService } from './governanceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GovernanceizabilityController],
  providers: [GovernanceizabilityStatusService, GovernanceizabilityAdminService],
  exports: [GovernanceizabilityAdminService],
})
export class GovernanceizabilityModule {}
