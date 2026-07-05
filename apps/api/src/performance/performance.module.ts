import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PerformanceAdminService } from './performance-admin.service.js'
import { PerformanceController } from './performance.controller.js'
import { PerformanceStatusService } from './performance-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    ObservabilityModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PerformanceController],
  providers: [PerformanceStatusService, PerformanceAdminService],
  exports: [PerformanceAdminService],
})
export class PerformanceModule {}
