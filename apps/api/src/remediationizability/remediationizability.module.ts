import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RemediationizabilityAdminService } from './remediationizability-admin.service.js'
import { RemediationizabilityController } from './remediationizability.controller.js'
import { RemediationizabilityStatusService } from './remediationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RemediationizabilityController],
  providers: [RemediationizabilityStatusService, RemediationizabilityAdminService],
  exports: [RemediationizabilityAdminService],
})
export class RemediationizabilityModule {}
