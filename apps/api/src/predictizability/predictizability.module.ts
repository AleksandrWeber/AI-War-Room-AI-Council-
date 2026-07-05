import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PredictizabilityAdminService } from './predictizability-admin.service.js'
import { PredictizabilityController } from './predictizability.controller.js'
import { PredictizabilityStatusService } from './predictizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PredictizabilityController],
  providers: [PredictizabilityStatusService, PredictizabilityAdminService],
  exports: [PredictizabilityAdminService],
})
export class PredictizabilityModule {}
