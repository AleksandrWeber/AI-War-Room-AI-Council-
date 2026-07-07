import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ChainofcustodyizabilityAdminService } from './chainofcustodyizability-admin.service.js'
import { ChainofcustodyizabilityController } from './chainofcustodyizability.controller.js'
import { ChainofcustodyizabilityStatusService } from './chainofcustodyizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ChainofcustodyizabilityController],
  providers: [ChainofcustodyizabilityStatusService, ChainofcustodyizabilityAdminService],
  exports: [ChainofcustodyizabilityAdminService],
})
export class ChainofcustodyizabilityModule {}
