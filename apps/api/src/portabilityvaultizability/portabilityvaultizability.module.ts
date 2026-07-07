import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PortabilityvaultizabilityAdminService } from './portabilityvaultizability-admin.service.js'
import { PortabilityvaultizabilityController } from './portabilityvaultizability.controller.js'
import { PortabilityvaultizabilityStatusService } from './portabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PortabilityvaultizabilityController],
  providers: [PortabilityvaultizabilityStatusService, PortabilityvaultizabilityAdminService],
  exports: [PortabilityvaultizabilityAdminService],
})
export class PortabilityvaultizabilityModule {}
