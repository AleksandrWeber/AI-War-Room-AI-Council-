import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WitnessledgerizabilityAdminService } from './witnessledgerizability-admin.service.js'
import { WitnessledgerizabilityController } from './witnessledgerizability.controller.js'
import { WitnessledgerizabilityStatusService } from './witnessledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WitnessledgerizabilityController],
  providers: [WitnessledgerizabilityStatusService, WitnessledgerizabilityAdminService],
  exports: [WitnessledgerizabilityAdminService],
})
export class WitnessledgerizabilityModule {}
