import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AccountabilityAdminService } from './accountability-admin.service.js'
import { AccountabilityController } from './accountability.controller.js'
import { AccountabilityStatusService } from './accountability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AccountabilityController],
  providers: [AccountabilityStatusService, AccountabilityAdminService],
  exports: [AccountabilityAdminService],
})
export class AccountabilityModule {}
