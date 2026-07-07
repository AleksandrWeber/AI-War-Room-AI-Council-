import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProoflineizabilityAdminService } from './prooflineizability-admin.service.js'
import { ProoflineizabilityController } from './prooflineizability.controller.js'
import { ProoflineizabilityStatusService } from './prooflineizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProoflineizabilityController],
  providers: [ProoflineizabilityStatusService, ProoflineizabilityAdminService],
  exports: [ProoflineizabilityAdminService],
})
export class ProoflineizabilityModule {}
