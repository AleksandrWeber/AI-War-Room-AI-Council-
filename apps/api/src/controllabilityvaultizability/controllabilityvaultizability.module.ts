import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ControllabilityvaultizabilityAdminService } from './controllabilityvaultizability-admin.service.js'
import { ControllabilityvaultizabilityController } from './controllabilityvaultizability.controller.js'
import { ControllabilityvaultizabilityStatusService } from './controllabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ControllabilityvaultizabilityController],
  providers: [ControllabilityvaultizabilityStatusService, ControllabilityvaultizabilityAdminService],
  exports: [ControllabilityvaultizabilityAdminService],
})
export class ControllabilityvaultizabilityModule {}
