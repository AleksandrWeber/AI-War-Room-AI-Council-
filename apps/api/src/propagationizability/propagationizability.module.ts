import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PropagationizabilityAdminService } from './propagationizability-admin.service.js'
import { PropagationizabilityController } from './propagationizability.controller.js'
import { PropagationizabilityStatusService } from './propagationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PropagationizabilityController],
  providers: [PropagationizabilityStatusService, PropagationizabilityAdminService],
  exports: [PropagationizabilityAdminService],
})
export class PropagationizabilityModule {}
