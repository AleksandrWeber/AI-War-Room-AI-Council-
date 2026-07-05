import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { QuorumizabilityAdminService } from './quorumizability-admin.service.js'
import { QuorumizabilityController } from './quorumizability.controller.js'
import { QuorumizabilityStatusService } from './quorumizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [QuorumizabilityController],
  providers: [QuorumizabilityStatusService, QuorumizabilityAdminService],
  exports: [QuorumizabilityAdminService],
})
export class QuorumizabilityModule {}
