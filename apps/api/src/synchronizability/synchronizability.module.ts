import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SynchronizabilityAdminService } from './synchronizability-admin.service.js'
import { SynchronizabilityController } from './synchronizability.controller.js'
import { SynchronizabilityStatusService } from './synchronizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SynchronizabilityController],
  providers: [SynchronizabilityStatusService, SynchronizabilityAdminService],
  exports: [SynchronizabilityAdminService],
})
export class SynchronizabilityModule {}
