import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GatewayizabilityAdminService } from './gatewayizability-admin.service.js'
import { GatewayizabilityController } from './gatewayizability.controller.js'
import { GatewayizabilityStatusService } from './gatewayizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GatewayizabilityController],
  providers: [GatewayizabilityStatusService, GatewayizabilityAdminService],
  exports: [GatewayizabilityAdminService],
})
export class GatewayizabilityModule {}
