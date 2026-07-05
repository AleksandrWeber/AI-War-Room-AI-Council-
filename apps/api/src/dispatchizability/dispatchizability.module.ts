import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DispatchizabilityAdminService } from './dispatchizability-admin.service.js'
import { DispatchizabilityController } from './dispatchizability.controller.js'
import { DispatchizabilityStatusService } from './dispatchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DispatchizabilityController],
  providers: [DispatchizabilityStatusService, DispatchizabilityAdminService],
  exports: [DispatchizabilityAdminService],
})
export class DispatchizabilityModule {}
