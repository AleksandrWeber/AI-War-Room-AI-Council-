import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConnectabilityvaultizabilityAdminService } from './connectabilityvaultizability-admin.service.js'
import { ConnectabilityvaultizabilityController } from './connectabilityvaultizability.controller.js'
import { ConnectabilityvaultizabilityStatusService } from './connectabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConnectabilityvaultizabilityController],
  providers: [ConnectabilityvaultizabilityStatusService, ConnectabilityvaultizabilityAdminService],
  exports: [ConnectabilityvaultizabilityAdminService],
})
export class ConnectabilityvaultizabilityModule {}
