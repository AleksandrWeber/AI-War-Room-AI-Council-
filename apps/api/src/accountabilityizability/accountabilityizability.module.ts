import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AccountabilityizabilityAdminService } from './accountabilityizability-admin.service.js'
import { AccountabilityizabilityController } from './accountabilityizability.controller.js'
import { AccountabilityizabilityStatusService } from './accountabilityizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AccountabilityizabilityController],
  providers: [AccountabilityizabilityStatusService, AccountabilityizabilityAdminService],
  exports: [AccountabilityizabilityAdminService],
})
export class AccountabilityizabilityModule {}
