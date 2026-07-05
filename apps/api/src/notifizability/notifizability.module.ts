import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NotifizabilityAdminService } from './notifizability-admin.service.js'
import { NotifizabilityController } from './notifizability.controller.js'
import { NotifizabilityStatusService } from './notifizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NotifizabilityController],
  providers: [NotifizabilityStatusService, NotifizabilityAdminService],
  exports: [NotifizabilityAdminService],
})
export class NotifizabilityModule {}
