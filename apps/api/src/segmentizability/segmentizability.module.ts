import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SegmentizabilityAdminService } from './segmentizability-admin.service.js'
import { SegmentizabilityController } from './segmentizability.controller.js'
import { SegmentizabilityStatusService } from './segmentizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SegmentizabilityController],
  providers: [SegmentizabilityStatusService, SegmentizabilityAdminService],
  exports: [SegmentizabilityAdminService],
})
export class SegmentizabilityModule {}
