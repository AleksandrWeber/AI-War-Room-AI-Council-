import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvidencizabilityAdminService } from './evidencizability-admin.service.js'
import { EvidencizabilityController } from './evidencizability.controller.js'
import { EvidencizabilityStatusService } from './evidencizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvidencizabilityController],
  providers: [EvidencizabilityStatusService, EvidencizabilityAdminService],
  exports: [EvidencizabilityAdminService],
})
export class EvidencizabilityModule {}
