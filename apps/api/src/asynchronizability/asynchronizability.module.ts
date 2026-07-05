import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AsynchronizabilityAdminService } from './asynchronizability-admin.service.js'
import { AsynchronizabilityController } from './asynchronizability.controller.js'
import { AsynchronizabilityStatusService } from './asynchronizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AsynchronizabilityController],
  providers: [AsynchronizabilityStatusService, AsynchronizabilityAdminService],
  exports: [AsynchronizabilityAdminService],
})
export class AsynchronizabilityModule {}
