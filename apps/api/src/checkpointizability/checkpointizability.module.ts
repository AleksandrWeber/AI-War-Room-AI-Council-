import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CheckpointizabilityAdminService } from './checkpointizability-admin.service.js'
import { CheckpointizabilityController } from './checkpointizability.controller.js'
import { CheckpointizabilityStatusService } from './checkpointizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CheckpointizabilityController],
  providers: [CheckpointizabilityStatusService, CheckpointizabilityAdminService],
  exports: [CheckpointizabilityAdminService],
})
export class CheckpointizabilityModule {}
