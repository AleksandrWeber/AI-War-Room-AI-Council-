import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MonitorabilityvaultizabilityAdminService } from './monitorabilityvaultizability-admin.service.js'
import { MonitorabilityvaultizabilityController } from './monitorabilityvaultizability.controller.js'
import { MonitorabilityvaultizabilityStatusService } from './monitorabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MonitorabilityvaultizabilityController],
  providers: [MonitorabilityvaultizabilityStatusService, MonitorabilityvaultizabilityAdminService],
  exports: [MonitorabilityvaultizabilityAdminService],
})
export class MonitorabilityvaultizabilityModule {}
