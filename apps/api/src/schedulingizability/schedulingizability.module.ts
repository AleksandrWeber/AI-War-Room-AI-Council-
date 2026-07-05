import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SchedulingizabilityAdminService } from './schedulingizability-admin.service.js'
import { SchedulingizabilityController } from './schedulingizability.controller.js'
import { SchedulingizabilityStatusService } from './schedulingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SchedulingizabilityController],
  providers: [SchedulingizabilityStatusService, SchedulingizabilityAdminService],
  exports: [SchedulingizabilityAdminService],
})
export class SchedulingizabilityModule {}
