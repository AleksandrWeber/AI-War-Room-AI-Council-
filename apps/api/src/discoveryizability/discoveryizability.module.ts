import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DiscoveryizabilityAdminService } from './discoveryizability-admin.service.js'
import { DiscoveryizabilityController } from './discoveryizability.controller.js'
import { DiscoveryizabilityStatusService } from './discoveryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DiscoveryizabilityController],
  providers: [DiscoveryizabilityStatusService, DiscoveryizabilityAdminService],
  exports: [DiscoveryizabilityAdminService],
})
export class DiscoveryizabilityModule {}
