import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CoordinationizabilityAdminService } from './coordinationizability-admin.service.js'
import { CoordinationizabilityController } from './coordinationizability.controller.js'
import { CoordinationizabilityStatusService } from './coordinationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CoordinationizabilityController],
  providers: [CoordinationizabilityStatusService, CoordinationizabilityAdminService],
  exports: [CoordinationizabilityAdminService],
})
export class CoordinationizabilityModule {}
