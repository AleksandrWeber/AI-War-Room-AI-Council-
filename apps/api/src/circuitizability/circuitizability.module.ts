import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CircuitizabilityAdminService } from './circuitizability-admin.service.js'
import { CircuitizabilityController } from './circuitizability.controller.js'
import { CircuitizabilityStatusService } from './circuitizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CircuitizabilityController],
  providers: [CircuitizabilityStatusService, CircuitizabilityAdminService],
  exports: [CircuitizabilityAdminService],
})
export class CircuitizabilityModule {}
