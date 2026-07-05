import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MonitorabilityAdminService } from './monitorability-admin.service.js'
import { MonitorabilityController } from './monitorability.controller.js'
import { MonitorabilityStatusService } from './monitorability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MonitorabilityController],
  providers: [MonitorabilityStatusService, MonitorabilityAdminService],
  exports: [MonitorabilityAdminService],
})
export class MonitorabilityModule {}
