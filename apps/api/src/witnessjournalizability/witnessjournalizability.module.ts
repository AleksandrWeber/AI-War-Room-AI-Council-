import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WitnessjournalizabilityAdminService } from './witnessjournalizability-admin.service.js'
import { WitnessjournalizabilityController } from './witnessjournalizability.controller.js'
import { WitnessjournalizabilityStatusService } from './witnessjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WitnessjournalizabilityController],
  providers: [WitnessjournalizabilityStatusService, WitnessjournalizabilityAdminService],
  exports: [WitnessjournalizabilityAdminService],
})
export class WitnessjournalizabilityModule {}
