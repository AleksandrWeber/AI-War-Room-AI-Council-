import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PartitionizabilityAdminService } from './partitionizability-admin.service.js'
import { PartitionizabilityController } from './partitionizability.controller.js'
import { PartitionizabilityStatusService } from './partitionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PartitionizabilityController],
  providers: [PartitionizabilityStatusService, PartitionizabilityAdminService],
  exports: [PartitionizabilityAdminService],
})
export class PartitionizabilityModule {}
