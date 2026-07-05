import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RoutingizabilityAdminService } from './routingizability-admin.service.js'
import { RoutingizabilityController } from './routingizability.controller.js'
import { RoutingizabilityStatusService } from './routingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RoutingizabilityController],
  providers: [RoutingizabilityStatusService, RoutingizabilityAdminService],
  exports: [RoutingizabilityAdminService],
})
export class RoutingizabilityModule {}
