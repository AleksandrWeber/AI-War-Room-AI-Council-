import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrchestrationizabilityAdminService } from './orchestrationizability-admin.service.js'
import { OrchestrationizabilityController } from './orchestrationizability.controller.js'
import { OrchestrationizabilityStatusService } from './orchestrationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrchestrationizabilityController],
  providers: [OrchestrationizabilityStatusService, OrchestrationizabilityAdminService],
  exports: [OrchestrationizabilityAdminService],
})
export class OrchestrationizabilityModule {}
