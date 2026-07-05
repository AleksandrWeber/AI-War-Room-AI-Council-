import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TriggeringizabilityAdminService } from './triggeringizability-admin.service.js'
import { TriggeringizabilityController } from './triggeringizability.controller.js'
import { TriggeringizabilityStatusService } from './triggeringizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TriggeringizabilityController],
  providers: [TriggeringizabilityStatusService, TriggeringizabilityAdminService],
  exports: [TriggeringizabilityAdminService],
})
export class TriggeringizabilityModule {}
