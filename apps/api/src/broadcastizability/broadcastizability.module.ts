import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BroadcastizabilityAdminService } from './broadcastizability-admin.service.js'
import { BroadcastizabilityController } from './broadcastizability.controller.js'
import { BroadcastizabilityStatusService } from './broadcastizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BroadcastizabilityController],
  providers: [BroadcastizabilityStatusService, BroadcastizabilityAdminService],
  exports: [BroadcastizabilityAdminService],
})
export class BroadcastizabilityModule {}
