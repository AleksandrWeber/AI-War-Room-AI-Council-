import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReplicabilizabilityAdminService } from './replicabilizability-admin.service.js'
import { ReplicabilizabilityController } from './replicabilizability.controller.js'
import { ReplicabilizabilityStatusService } from './replicabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReplicabilizabilityController],
  providers: [ReplicabilizabilityStatusService, ReplicabilizabilityAdminService],
  exports: [ReplicabilizabilityAdminService],
})
export class ReplicabilizabilityModule {}
