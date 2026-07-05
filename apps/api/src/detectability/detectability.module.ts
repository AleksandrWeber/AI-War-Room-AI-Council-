import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DetectabilityAdminService } from './detectability-admin.service.js'
import { DetectabilityController } from './detectability.controller.js'
import { DetectabilityStatusService } from './detectability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DetectabilityController],
  providers: [DetectabilityStatusService, DetectabilityAdminService],
  exports: [DetectabilityAdminService],
})
export class DetectabilityModule {}
