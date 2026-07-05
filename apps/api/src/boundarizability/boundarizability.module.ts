import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BoundarizabilityAdminService } from './boundarizability-admin.service.js'
import { BoundarizabilityController } from './boundarizability.controller.js'
import { BoundarizabilityStatusService } from './boundarizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BoundarizabilityController],
  providers: [BoundarizabilityStatusService, BoundarizabilityAdminService],
  exports: [BoundarizabilityAdminService],
})
export class BoundarizabilityModule {}
