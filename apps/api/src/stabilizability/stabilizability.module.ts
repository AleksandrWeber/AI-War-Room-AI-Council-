import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StabilizabilityAdminService } from './stabilizability-admin.service.js'
import { StabilizabilityController } from './stabilizability.controller.js'
import { StabilizabilityStatusService } from './stabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StabilizabilityController],
  providers: [StabilizabilityStatusService, StabilizabilityAdminService],
  exports: [StabilizabilityAdminService],
})
export class StabilizabilityModule {}
