import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VisualizabilityAdminService } from './visualizability-admin.service.js'
import { VisualizabilityController } from './visualizability.controller.js'
import { VisualizabilityStatusService } from './visualizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VisualizabilityController],
  providers: [VisualizabilityStatusService, VisualizabilityAdminService],
  exports: [VisualizabilityAdminService],
})
export class VisualizabilityModule {}
