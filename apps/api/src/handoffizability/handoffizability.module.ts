import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HandoffizabilityAdminService } from './handoffizability-admin.service.js'
import { HandoffizabilityController } from './handoffizability.controller.js'
import { HandoffizabilityStatusService } from './handoffizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HandoffizabilityController],
  providers: [HandoffizabilityStatusService, HandoffizabilityAdminService],
  exports: [HandoffizabilityAdminService],
})
export class HandoffizabilityModule {}
