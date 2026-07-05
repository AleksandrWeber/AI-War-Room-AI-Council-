import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { UpgradizabilityAdminService } from './upgradizability-admin.service.js'
import { UpgradizabilityController } from './upgradizability.controller.js'
import { UpgradizabilityStatusService } from './upgradizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [UpgradizabilityController],
  providers: [UpgradizabilityStatusService, UpgradizabilityAdminService],
  exports: [UpgradizabilityAdminService],
})
export class UpgradizabilityModule {}
