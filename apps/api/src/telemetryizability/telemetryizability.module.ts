import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TelemetryizabilityAdminService } from './telemetryizability-admin.service.js'
import { TelemetryizabilityController } from './telemetryizability.controller.js'
import { TelemetryizabilityStatusService } from './telemetryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TelemetryizabilityController],
  providers: [TelemetryizabilityStatusService, TelemetryizabilityAdminService],
  exports: [TelemetryizabilityAdminService],
})
export class TelemetryizabilityModule {}
