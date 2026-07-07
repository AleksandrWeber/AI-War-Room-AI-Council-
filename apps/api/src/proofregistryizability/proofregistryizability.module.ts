import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProofregistryizabilityAdminService } from './proofregistryizability-admin.service.js'
import { ProofregistryizabilityController } from './proofregistryizability.controller.js'
import { ProofregistryizabilityStatusService } from './proofregistryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProofregistryizabilityController],
  providers: [ProofregistryizabilityStatusService, ProofregistryizabilityAdminService],
  exports: [ProofregistryizabilityAdminService],
})
export class ProofregistryizabilityModule {}
