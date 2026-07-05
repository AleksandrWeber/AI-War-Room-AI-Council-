import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PipeliningizabilityAdminService } from './pipeliningizability-admin.service.js'
import { PipeliningizabilityController } from './pipeliningizability.controller.js'
import { PipeliningizabilityStatusService } from './pipeliningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PipeliningizabilityController],
  providers: [PipeliningizabilityStatusService, PipeliningizabilityAdminService],
  exports: [PipeliningizabilityAdminService],
})
export class PipeliningizabilityModule {}
