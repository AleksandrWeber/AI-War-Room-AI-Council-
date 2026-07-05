import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FanoutizabilityAdminService } from './fanoutizability-admin.service.js'
import { FanoutizabilityController } from './fanoutizability.controller.js'
import { FanoutizabilityStatusService } from './fanoutizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FanoutizabilityController],
  providers: [FanoutizabilityStatusService, FanoutizabilityAdminService],
  exports: [FanoutizabilityAdminService],
})
export class FanoutizabilityModule {}
