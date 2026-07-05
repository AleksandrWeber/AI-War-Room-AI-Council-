import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TimeoutizabilityAdminService } from './timeoutizability-admin.service.js'
import { TimeoutizabilityController } from './timeoutizability.controller.js'
import { TimeoutizabilityStatusService } from './timeoutizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TimeoutizabilityController],
  providers: [TimeoutizabilityStatusService, TimeoutizabilityAdminService],
  exports: [TimeoutizabilityAdminService],
})
export class TimeoutizabilityModule {}
