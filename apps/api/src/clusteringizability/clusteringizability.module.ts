import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ClusteringizabilityAdminService } from './clusteringizability-admin.service.js'
import { ClusteringizabilityController } from './clusteringizability.controller.js'
import { ClusteringizabilityStatusService } from './clusteringizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ClusteringizabilityController],
  providers: [ClusteringizabilityStatusService, ClusteringizabilityAdminService],
  exports: [ClusteringizabilityAdminService],
})
export class ClusteringizabilityModule {}
