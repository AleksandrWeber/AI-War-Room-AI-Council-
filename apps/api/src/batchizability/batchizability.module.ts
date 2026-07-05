import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BatchizabilityAdminService } from './batchizability-admin.service.js'
import { BatchizabilityController } from './batchizability.controller.js'
import { BatchizabilityStatusService } from './batchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BatchizabilityController],
  providers: [BatchizabilityStatusService, BatchizabilityAdminService],
  exports: [BatchizabilityAdminService],
})
export class BatchizabilityModule {}
