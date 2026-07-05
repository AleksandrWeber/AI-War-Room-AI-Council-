import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ObservabilizabilityAdminService } from './observabilizability-admin.service.js'
import { ObservabilizabilityController } from './observabilizability.controller.js'
import { ObservabilizabilityStatusService } from './observabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ObservabilizabilityController],
  providers: [ObservabilizabilityStatusService, ObservabilizabilityAdminService],
  exports: [ObservabilizabilityAdminService],
})
export class ObservabilizabilityModule {}
