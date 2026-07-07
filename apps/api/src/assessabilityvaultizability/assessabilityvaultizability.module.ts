import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssessabilityvaultizabilityAdminService } from './assessabilityvaultizability-admin.service.js'
import { AssessabilityvaultizabilityController } from './assessabilityvaultizability.controller.js'
import { AssessabilityvaultizabilityStatusService } from './assessabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssessabilityvaultizabilityController],
  providers: [AssessabilityvaultizabilityStatusService, AssessabilityvaultizabilityAdminService],
  exports: [AssessabilityvaultizabilityAdminService],
})
export class AssessabilityvaultizabilityModule {}
