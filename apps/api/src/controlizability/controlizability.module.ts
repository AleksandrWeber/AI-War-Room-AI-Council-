import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ControlizabilityAdminService } from './controlizability-admin.service.js'
import { ControlizabilityController } from './controlizability.controller.js'
import { ControlizabilityStatusService } from './controlizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ControlizabilityController],
  providers: [ControlizabilityStatusService, ControlizabilityAdminService],
  exports: [ControlizabilityAdminService],
})
export class ControlizabilityModule {}
