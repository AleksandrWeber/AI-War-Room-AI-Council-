import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProtocolizabilityAdminService } from './protocolizability-admin.service.js'
import { ProtocolizabilityController } from './protocolizability.controller.js'
import { ProtocolizabilityStatusService } from './protocolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProtocolizabilityController],
  providers: [ProtocolizabilityStatusService, ProtocolizabilityAdminService],
  exports: [ProtocolizabilityAdminService],
})
export class ProtocolizabilityModule {}
