import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ClusterizabilityAdminService } from './clusterizability-admin.service.js'
import { ClusterizabilityController } from './clusterizability.controller.js'
import { ClusterizabilityStatusService } from './clusterizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ClusterizabilityController],
  providers: [ClusterizabilityStatusService, ClusterizabilityAdminService],
  exports: [ClusterizabilityAdminService],
})
export class ClusterizabilityModule {}
