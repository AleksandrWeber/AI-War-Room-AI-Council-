import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EventizabilityAdminService } from './eventizability-admin.service.js'
import { EventizabilityController } from './eventizability.controller.js'
import { EventizabilityStatusService } from './eventizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EventizabilityController],
  providers: [EventizabilityStatusService, EventizabilityAdminService],
  exports: [EventizabilityAdminService],
})
export class EventizabilityModule {}
