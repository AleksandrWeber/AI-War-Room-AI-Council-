import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NetworkizabilityAdminService } from './networkizability-admin.service.js'
import { NetworkizabilityController } from './networkizability.controller.js'
import { NetworkizabilityStatusService } from './networkizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NetworkizabilityController],
  providers: [NetworkizabilityStatusService, NetworkizabilityAdminService],
  exports: [NetworkizabilityAdminService],
})
export class NetworkizabilityModule {}
