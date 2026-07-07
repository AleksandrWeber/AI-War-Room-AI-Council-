import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PolicyproofizabilityAdminService } from './policyproofizability-admin.service.js'
import { PolicyproofizabilityController } from './policyproofizability.controller.js'
import { PolicyproofizabilityStatusService } from './policyproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PolicyproofizabilityController],
  providers: [PolicyproofizabilityStatusService, PolicyproofizabilityAdminService],
  exports: [PolicyproofizabilityAdminService],
})
export class PolicyproofizabilityModule {}
