import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ControllabilityAdminService } from './controllability-admin.service.js'
import { ControllabilityController } from './controllability.controller.js'
import { ControllabilityStatusService } from './controllability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ControllabilityController],
  providers: [ControllabilityStatusService, ControllabilityAdminService],
  exports: [ControllabilityAdminService],
})
export class ControllabilityModule {}
