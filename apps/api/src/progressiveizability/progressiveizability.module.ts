import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProgressiveizabilityAdminService } from './progressiveizability-admin.service.js'
import { ProgressiveizabilityController } from './progressiveizability.controller.js'
import { ProgressiveizabilityStatusService } from './progressiveizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProgressiveizabilityController],
  providers: [ProgressiveizabilityStatusService, ProgressiveizabilityAdminService],
  exports: [ProgressiveizabilityAdminService],
})
export class ProgressiveizabilityModule {}
