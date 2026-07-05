import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StreamizabilityAdminService } from './streamizability-admin.service.js'
import { StreamizabilityController } from './streamizability.controller.js'
import { StreamizabilityStatusService } from './streamizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StreamizabilityController],
  providers: [StreamizabilityStatusService, StreamizabilityAdminService],
  exports: [StreamizabilityAdminService],
})
export class StreamizabilityModule {}
