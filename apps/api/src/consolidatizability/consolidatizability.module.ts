import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConsolidatizabilityAdminService } from './consolidatizability-admin.service.js'
import { ConsolidatizabilityController } from './consolidatizability.controller.js'
import { ConsolidatizabilityStatusService } from './consolidatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConsolidatizabilityController],
  providers: [ConsolidatizabilityStatusService, ConsolidatizabilityAdminService],
  exports: [ConsolidatizabilityAdminService],
})
export class ConsolidatizabilityModule {}
