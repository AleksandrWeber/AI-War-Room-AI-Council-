import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExplainabilityvaultizabilityAdminService } from './explainabilityvaultizability-admin.service.js'
import { ExplainabilityvaultizabilityController } from './explainabilityvaultizability.controller.js'
import { ExplainabilityvaultizabilityStatusService } from './explainabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExplainabilityvaultizabilityController],
  providers: [ExplainabilityvaultizabilityStatusService, ExplainabilityvaultizabilityAdminService],
  exports: [ExplainabilityvaultizabilityAdminService],
})
export class ExplainabilityvaultizabilityModule {}
