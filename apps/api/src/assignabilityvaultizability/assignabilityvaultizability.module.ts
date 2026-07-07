import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssignabilityvaultizabilityAdminService } from './assignabilityvaultizability-admin.service.js'
import { AssignabilityvaultizabilityController } from './assignabilityvaultizability.controller.js'
import { AssignabilityvaultizabilityStatusService } from './assignabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssignabilityvaultizabilityController],
  providers: [AssignabilityvaultizabilityStatusService, AssignabilityvaultizabilityAdminService],
  exports: [AssignabilityvaultizabilityAdminService],
})
export class AssignabilityvaultizabilityModule {}
