import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PartitioningizabilityAdminService } from './partitioningizability-admin.service.js'
import { PartitioningizabilityController } from './partitioningizability.controller.js'
import { PartitioningizabilityStatusService } from './partitioningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PartitioningizabilityController],
  providers: [PartitioningizabilityStatusService, PartitioningizabilityAdminService],
  exports: [PartitioningizabilityAdminService],
})
export class PartitioningizabilityModule {}
