import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TriggerizabilityAdminService } from './triggerizability-admin.service.js'
import { TriggerizabilityController } from './triggerizability.controller.js'
import { TriggerizabilityStatusService } from './triggerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TriggerizabilityController],
  providers: [TriggerizabilityStatusService, TriggerizabilityAdminService],
  exports: [TriggerizabilityAdminService],
})
export class TriggerizabilityModule {}
