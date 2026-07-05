import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PredictabilityAdminService } from './predictability-admin.service.js'
import { PredictabilityController } from './predictability.controller.js'
import { PredictabilityStatusService } from './predictability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PredictabilityController],
  providers: [PredictabilityStatusService, PredictabilityAdminService],
  exports: [PredictabilityAdminService],
})
export class PredictabilityModule {}
