import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BalancingizabilityAdminService } from './balancingizability-admin.service.js'
import { BalancingizabilityController } from './balancingizability.controller.js'
import { BalancingizabilityStatusService } from './balancingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BalancingizabilityController],
  providers: [BalancingizabilityStatusService, BalancingizabilityAdminService],
  exports: [BalancingizabilityAdminService],
})
export class BalancingizabilityModule {}
