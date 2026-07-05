import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IncidentAdminService } from './incident-admin.service.js'
import { IncidentController } from './incident.controller.js'
import { IncidentStatusService } from './incident-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    ObservabilityModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IncidentController],
  providers: [IncidentStatusService, IncidentAdminService],
  exports: [IncidentAdminService],
})
export class IncidentsModule {}
