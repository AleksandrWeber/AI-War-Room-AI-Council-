import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SchedulizabilityAdminService } from './schedulizability-admin.service.js'
import { SchedulizabilityController } from './schedulizability.controller.js'
import { SchedulizabilityStatusService } from './schedulizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SchedulizabilityController],
  providers: [SchedulizabilityStatusService, SchedulizabilityAdminService],
  exports: [SchedulizabilityAdminService],
})
export class SchedulizabilityModule {}
