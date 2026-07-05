import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdaptabilityAdminService } from './adaptability-admin.service.js'
import { AdaptabilityController } from './adaptability.controller.js'
import { AdaptabilityStatusService } from './adaptability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdaptabilityController],
  providers: [AdaptabilityStatusService, AdaptabilityAdminService],
  exports: [AdaptabilityAdminService],
})
export class AdaptabilityModule {}
