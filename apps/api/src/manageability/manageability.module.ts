import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ManageabilityAdminService } from './manageability-admin.service.js'
import { ManageabilityController } from './manageability.controller.js'
import { ManageabilityStatusService } from './manageability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ManageabilityController],
  providers: [ManageabilityStatusService, ManageabilityAdminService],
  exports: [ManageabilityAdminService],
})
export class ManageabilityModule {}
