import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GovernancetrackizabilityAdminService } from './governancetrackizability-admin.service.js'
import { GovernancetrackizabilityController } from './governancetrackizability.controller.js'
import { GovernancetrackizabilityStatusService } from './governancetrackizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GovernancetrackizabilityController],
  providers: [GovernancetrackizabilityStatusService, GovernancetrackizabilityAdminService],
  exports: [GovernancetrackizabilityAdminService],
})
export class GovernancetrackizabilityModule {}
