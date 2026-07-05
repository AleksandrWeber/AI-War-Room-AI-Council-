import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FederatizabilityAdminService } from './federatizability-admin.service.js'
import { FederatizabilityController } from './federatizability.controller.js'
import { FederatizabilityStatusService } from './federatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FederatizabilityController],
  providers: [FederatizabilityStatusService, FederatizabilityAdminService],
  exports: [FederatizabilityAdminService],
})
export class FederatizabilityModule {}
