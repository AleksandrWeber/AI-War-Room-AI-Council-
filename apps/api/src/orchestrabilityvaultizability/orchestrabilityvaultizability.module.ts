import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrchestrabilityvaultizabilityAdminService } from './orchestrabilityvaultizability-admin.service.js'
import { OrchestrabilityvaultizabilityController } from './orchestrabilityvaultizability.controller.js'
import { OrchestrabilityvaultizabilityStatusService } from './orchestrabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrchestrabilityvaultizabilityController],
  providers: [OrchestrabilityvaultizabilityStatusService, OrchestrabilityvaultizabilityAdminService],
  exports: [OrchestrabilityvaultizabilityAdminService],
})
export class OrchestrabilityvaultizabilityModule {}
