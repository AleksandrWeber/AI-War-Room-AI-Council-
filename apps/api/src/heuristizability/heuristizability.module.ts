import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HeuristizabilityAdminService } from './heuristizability-admin.service.js'
import { HeuristizabilityController } from './heuristizability.controller.js'
import { HeuristizabilityStatusService } from './heuristizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HeuristizabilityController],
  providers: [HeuristizabilityStatusService, HeuristizabilityAdminService],
  exports: [HeuristizabilityAdminService],
})
export class HeuristizabilityModule {}
