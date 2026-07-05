import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AutoscalingizabilityAdminService } from './autoscalingizability-admin.service.js'
import { AutoscalingizabilityController } from './autoscalingizability.controller.js'
import { AutoscalingizabilityStatusService } from './autoscalingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AutoscalingizabilityController],
  providers: [AutoscalingizabilityStatusService, AutoscalingizabilityAdminService],
  exports: [AutoscalingizabilityAdminService],
})
export class AutoscalingizabilityModule {}
