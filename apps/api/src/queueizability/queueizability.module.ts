import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { QueueizabilityAdminService } from './queueizability-admin.service.js'
import { QueueizabilityController } from './queueizability.controller.js'
import { QueueizabilityStatusService } from './queueizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [QueueizabilityController],
  providers: [QueueizabilityStatusService, QueueizabilityAdminService],
  exports: [QueueizabilityAdminService],
})
export class QueueizabilityModule {}
