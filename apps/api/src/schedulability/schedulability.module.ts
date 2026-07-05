import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SchedulabilityAdminService } from './schedulability-admin.service.js'
import { SchedulabilityController } from './schedulability.controller.js'
import { SchedulabilityStatusService } from './schedulability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SchedulabilityController],
  providers: [SchedulabilityStatusService, SchedulabilityAdminService],
  exports: [SchedulabilityAdminService],
})
export class SchedulabilityModule {}
