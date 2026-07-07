import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvidencetrackizabilityAdminService } from './evidencetrackizability-admin.service.js'
import { EvidencetrackizabilityController } from './evidencetrackizability.controller.js'
import { EvidencetrackizabilityStatusService } from './evidencetrackizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvidencetrackizabilityController],
  providers: [EvidencetrackizabilityStatusService, EvidencetrackizabilityAdminService],
  exports: [EvidencetrackizabilityAdminService],
})
export class EvidencetrackizabilityModule {}
