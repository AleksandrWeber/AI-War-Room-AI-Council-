import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GovernanceAdminService } from './governance-admin.service.js'
import { GovernanceController } from './governance.controller.js'
import { GovernanceStatusService } from './governance-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GovernanceController],
  providers: [GovernanceStatusService, GovernanceAdminService],
  exports: [GovernanceAdminService],
})
export class GovernanceModule {}
