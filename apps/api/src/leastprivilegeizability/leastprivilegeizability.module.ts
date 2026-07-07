import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LeastprivilegeizabilityAdminService } from './leastprivilegeizability-admin.service.js'
import { LeastprivilegeizabilityController } from './leastprivilegeizability.controller.js'
import { LeastprivilegeizabilityStatusService } from './leastprivilegeizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LeastprivilegeizabilityController],
  providers: [LeastprivilegeizabilityStatusService, LeastprivilegeizabilityAdminService],
  exports: [LeastprivilegeizabilityAdminService],
})
export class LeastprivilegeizabilityModule {}
