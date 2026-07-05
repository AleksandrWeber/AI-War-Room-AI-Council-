import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StratifiabilityAdminService } from './stratifiability-admin.service.js'
import { StratifiabilityController } from './stratifiability.controller.js'
import { StratifiabilityStatusService } from './stratifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StratifiabilityController],
  providers: [StratifiabilityStatusService, StratifiabilityAdminService],
  exports: [StratifiabilityAdminService],
})
export class StratifiabilityModule {}
