import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OperabilityvaultizabilityAdminService } from './operabilityvaultizability-admin.service.js'
import { OperabilityvaultizabilityController } from './operabilityvaultizability.controller.js'
import { OperabilityvaultizabilityStatusService } from './operabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OperabilityvaultizabilityController],
  providers: [OperabilityvaultizabilityStatusService, OperabilityvaultizabilityAdminService],
  exports: [OperabilityvaultizabilityAdminService],
})
export class OperabilityvaultizabilityModule {}
