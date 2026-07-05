import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ChainingizabilityAdminService } from './chainingizability-admin.service.js'
import { ChainingizabilityController } from './chainingizability.controller.js'
import { ChainingizabilityStatusService } from './chainingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ChainingizabilityController],
  providers: [ChainingizabilityStatusService, ChainingizabilityAdminService],
  exports: [ChainingizabilityAdminService],
})
export class ChainingizabilityModule {}
