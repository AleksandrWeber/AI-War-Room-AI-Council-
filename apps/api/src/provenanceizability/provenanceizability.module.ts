import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProvenanceizabilityAdminService } from './provenanceizability-admin.service.js'
import { ProvenanceizabilityController } from './provenanceizability.controller.js'
import { ProvenanceizabilityStatusService } from './provenanceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProvenanceizabilityController],
  providers: [ProvenanceizabilityStatusService, ProvenanceizabilityAdminService],
  exports: [ProvenanceizabilityAdminService],
})
export class ProvenanceizabilityModule {}
