import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SloAdminService } from './slo-admin.service.js'
import { SloController } from './slo.controller.js'
import { SloStatusService } from './slo-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    ObservabilityModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SloController],
  providers: [SloStatusService, SloAdminService],
  exports: [SloAdminService],
})
export class SloModule {}
