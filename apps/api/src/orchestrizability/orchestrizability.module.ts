import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrchestrizabilityAdminService } from './orchestrizability-admin.service.js'
import { OrchestrizabilityController } from './orchestrizability.controller.js'
import { OrchestrizabilityStatusService } from './orchestrizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrchestrizabilityController],
  providers: [OrchestrizabilityStatusService, OrchestrizabilityAdminService],
  exports: [OrchestrizabilityAdminService],
})
export class OrchestrizabilityModule {}
