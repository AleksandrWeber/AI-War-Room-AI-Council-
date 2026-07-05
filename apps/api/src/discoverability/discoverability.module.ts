import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DiscoverabilityAdminService } from './discoverability-admin.service.js'
import { DiscoverabilityController } from './discoverability.controller.js'
import { DiscoverabilityStatusService } from './discoverability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DiscoverabilityController],
  providers: [DiscoverabilityStatusService, DiscoverabilityAdminService],
  exports: [DiscoverabilityAdminService],
})
export class DiscoverabilityModule {}
