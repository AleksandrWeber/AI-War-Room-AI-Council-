import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HealingizabilityAdminService } from './healingizability-admin.service.js'
import { HealingizabilityController } from './healingizability.controller.js'
import { HealingizabilityStatusService } from './healingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HealingizabilityController],
  providers: [HealingizabilityStatusService, HealingizabilityAdminService],
  exports: [HealingizabilityAdminService],
})
export class HealingizabilityModule {}
