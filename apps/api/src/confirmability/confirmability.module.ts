import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConfirmabilityAdminService } from './confirmability-admin.service.js'
import { ConfirmabilityController } from './confirmability.controller.js'
import { ConfirmabilityStatusService } from './confirmability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConfirmabilityController],
  providers: [ConfirmabilityStatusService, ConfirmabilityAdminService],
  exports: [ConfirmabilityAdminService],
})
export class ConfirmabilityModule {}
