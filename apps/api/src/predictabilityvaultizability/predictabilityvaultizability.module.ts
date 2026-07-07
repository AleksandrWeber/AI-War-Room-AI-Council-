import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PredictabilityvaultizabilityAdminService } from './predictabilityvaultizability-admin.service.js'
import { PredictabilityvaultizabilityController } from './predictabilityvaultizability.controller.js'
import { PredictabilityvaultizabilityStatusService } from './predictabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PredictabilityvaultizabilityController],
  providers: [PredictabilityvaultizabilityStatusService, PredictabilityvaultizabilityAdminService],
  exports: [PredictabilityvaultizabilityAdminService],
})
export class PredictabilityvaultizabilityModule {}
