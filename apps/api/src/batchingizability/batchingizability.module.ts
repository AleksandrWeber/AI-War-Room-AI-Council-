import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BatchingizabilityAdminService } from './batchingizability-admin.service.js'
import { BatchingizabilityController } from './batchingizability.controller.js'
import { BatchingizabilityStatusService } from './batchingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BatchingizabilityController],
  providers: [BatchingizabilityStatusService, BatchingizabilityAdminService],
  exports: [BatchingizabilityAdminService],
})
export class BatchingizabilityModule {}
