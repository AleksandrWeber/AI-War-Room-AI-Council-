import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TopologizabilityAdminService } from './topologizability-admin.service.js'
import { TopologizabilityController } from './topologizability.controller.js'
import { TopologizabilityStatusService } from './topologizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TopologizabilityController],
  providers: [TopologizabilityStatusService, TopologizabilityAdminService],
  exports: [TopologizabilityAdminService],
})
export class TopologizabilityModule {}
