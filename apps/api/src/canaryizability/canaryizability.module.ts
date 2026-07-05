import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CanaryizabilityAdminService } from './canaryizability-admin.service.js'
import { CanaryizabilityController } from './canaryizability.controller.js'
import { CanaryizabilityStatusService } from './canaryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CanaryizabilityController],
  providers: [CanaryizabilityStatusService, CanaryizabilityAdminService],
  exports: [CanaryizabilityAdminService],
})
export class CanaryizabilityModule {}
