import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { RunsModule } from '../runs/runs.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ObservabilityAdminService } from './observability-admin.service.js'
import { ObservabilityController } from './observability.controller.js'
import { ObservabilityService } from './observability.service.js'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    WorkspacesModule,
    PersistenceModule,
    forwardRef(() => RunsModule),
  ],
  controllers: [ObservabilityController],
  providers: [ObservabilityService, ObservabilityAdminService],
  exports: [ObservabilityService, ObservabilityAdminService],
})
export class ObservabilityModule {}
