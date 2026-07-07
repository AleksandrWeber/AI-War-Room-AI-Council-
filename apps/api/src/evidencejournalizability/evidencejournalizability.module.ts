import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvidencejournalizabilityAdminService } from './evidencejournalizability-admin.service.js'
import { EvidencejournalizabilityController } from './evidencejournalizability.controller.js'
import { EvidencejournalizabilityStatusService } from './evidencejournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvidencejournalizabilityController],
  providers: [EvidencejournalizabilityStatusService, EvidencejournalizabilityAdminService],
  exports: [EvidencejournalizabilityAdminService],
})
export class EvidencejournalizabilityModule {}
