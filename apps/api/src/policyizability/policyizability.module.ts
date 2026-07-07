import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PolicyizabilityAdminService } from './policyizability-admin.service.js'
import { PolicyizabilityController } from './policyizability.controller.js'
import { PolicyizabilityStatusService } from './policyizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PolicyizabilityController],
  providers: [PolicyizabilityStatusService, PolicyizabilityAdminService],
  exports: [PolicyizabilityAdminService],
})
export class PolicyizabilityModule {}
