import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ApproximatizabilityAdminService } from './approximatizability-admin.service.js'
import { ApproximatizabilityController } from './approximatizability.controller.js'
import { ApproximatizabilityStatusService } from './approximatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ApproximatizabilityController],
  providers: [ApproximatizabilityStatusService, ApproximatizabilityAdminService],
  exports: [ApproximatizabilityAdminService],
})
export class ApproximatizabilityModule {}
