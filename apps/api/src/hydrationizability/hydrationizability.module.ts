import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HydrationizabilityAdminService } from './hydrationizability-admin.service.js'
import { HydrationizabilityController } from './hydrationizability.controller.js'
import { HydrationizabilityStatusService } from './hydrationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HydrationizabilityController],
  providers: [HydrationizabilityStatusService, HydrationizabilityAdminService],
  exports: [HydrationizabilityAdminService],
})
export class HydrationizabilityModule {}
