import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeployabilityvaultizabilityAdminService } from './deployabilityvaultizability-admin.service.js'
import { DeployabilityvaultizabilityController } from './deployabilityvaultizability.controller.js'
import { DeployabilityvaultizabilityStatusService } from './deployabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeployabilityvaultizabilityController],
  providers: [DeployabilityvaultizabilityStatusService, DeployabilityvaultizabilityAdminService],
  exports: [DeployabilityvaultizabilityAdminService],
})
export class DeployabilityvaultizabilityModule {}
