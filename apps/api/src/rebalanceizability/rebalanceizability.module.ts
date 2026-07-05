import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RebalanceizabilityAdminService } from './rebalanceizability-admin.service.js'
import { RebalanceizabilityController } from './rebalanceizability.controller.js'
import { RebalanceizabilityStatusService } from './rebalanceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RebalanceizabilityController],
  providers: [RebalanceizabilityStatusService, RebalanceizabilityAdminService],
  exports: [RebalanceizabilityAdminService],
})
export class RebalanceizabilityModule {}
