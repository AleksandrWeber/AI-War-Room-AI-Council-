import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TerminologizabilityAdminService } from './terminologizability-admin.service.js'
import { TerminologizabilityController } from './terminologizability.controller.js'
import { TerminologizabilityStatusService } from './terminologizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TerminologizabilityController],
  providers: [TerminologizabilityStatusService, TerminologizabilityAdminService],
  exports: [TerminologizabilityAdminService],
})
export class TerminologizabilityModule {}
