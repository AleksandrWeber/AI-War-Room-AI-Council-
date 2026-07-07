import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScalingizabilityAdminService } from './scalingizability-admin.service.js'
import { ScalingizabilityController } from './scalingizability.controller.js'
import { ScalingizabilityStatusService } from './scalingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScalingizabilityController],
  providers: [ScalingizabilityStatusService, ScalingizabilityAdminService],
  exports: [ScalingizabilityAdminService],
})
export class ScalingizabilityModule {}
