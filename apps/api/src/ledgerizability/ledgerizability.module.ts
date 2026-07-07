import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LedgerizabilityAdminService } from './ledgerizability-admin.service.js'
import { LedgerizabilityController } from './ledgerizability.controller.js'
import { LedgerizabilityStatusService } from './ledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LedgerizabilityController],
  providers: [LedgerizabilityStatusService, LedgerizabilityAdminService],
  exports: [LedgerizabilityAdminService],
})
export class LedgerizabilityModule {}
