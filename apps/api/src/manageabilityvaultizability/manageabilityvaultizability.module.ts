import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ManageabilityvaultizabilityAdminService } from './manageabilityvaultizability-admin.service.js'
import { ManageabilityvaultizabilityController } from './manageabilityvaultizability.controller.js'
import { ManageabilityvaultizabilityStatusService } from './manageabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ManageabilityvaultizabilityController],
  providers: [ManageabilityvaultizabilityStatusService, ManageabilityvaultizabilityAdminService],
  exports: [ManageabilityvaultizabilityAdminService],
})
export class ManageabilityvaultizabilityModule {}
