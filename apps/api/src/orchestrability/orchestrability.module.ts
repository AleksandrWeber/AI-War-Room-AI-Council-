import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrchestrabilityAdminService } from './orchestrability-admin.service.js'
import { OrchestrabilityController } from './orchestrability.controller.js'
import { OrchestrabilityStatusService } from './orchestrability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrchestrabilityController],
  providers: [OrchestrabilityStatusService, OrchestrabilityAdminService],
  exports: [OrchestrabilityAdminService],
})
export class OrchestrabilityModule {}
