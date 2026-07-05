import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompactionizabilityAdminService } from './compactionizability-admin.service.js'
import { CompactionizabilityController } from './compactionizability.controller.js'
import { CompactionizabilityStatusService } from './compactionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompactionizabilityController],
  providers: [CompactionizabilityStatusService, CompactionizabilityAdminService],
  exports: [CompactionizabilityAdminService],
})
export class CompactionizabilityModule {}
