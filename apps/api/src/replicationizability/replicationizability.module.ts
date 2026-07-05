import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReplicationizabilityAdminService } from './replicationizability-admin.service.js'
import { ReplicationizabilityController } from './replicationizability.controller.js'
import { ReplicationizabilityStatusService } from './replicationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReplicationizabilityController],
  providers: [ReplicationizabilityStatusService, ReplicationizabilityAdminService],
  exports: [ReplicationizabilityAdminService],
})
export class ReplicationizabilityModule {}
