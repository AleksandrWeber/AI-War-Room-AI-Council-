import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AlertabilizabilityAdminService } from './alertabilizability-admin.service.js'
import { AlertabilizabilityController } from './alertabilizability.controller.js'
import { AlertabilizabilityStatusService } from './alertabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AlertabilizabilityController],
  providers: [AlertabilizabilityStatusService, AlertabilizabilityAdminService],
  exports: [AlertabilizabilityAdminService],
})
export class AlertabilizabilityModule {}
