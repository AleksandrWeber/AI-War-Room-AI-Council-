import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RelayizabilityAdminService } from './relayizability-admin.service.js'
import { RelayizabilityController } from './relayizability.controller.js'
import { RelayizabilityStatusService } from './relayizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RelayizabilityController],
  providers: [RelayizabilityStatusService, RelayizabilityAdminService],
  exports: [RelayizabilityAdminService],
})
export class RelayizabilityModule {}
