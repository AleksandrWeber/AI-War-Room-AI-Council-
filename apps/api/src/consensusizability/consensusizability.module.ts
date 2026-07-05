import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConsensusizabilityAdminService } from './consensusizability-admin.service.js'
import { ConsensusizabilityController } from './consensusizability.controller.js'
import { ConsensusizabilityStatusService } from './consensusizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConsensusizabilityController],
  providers: [ConsensusizabilityStatusService, ConsensusizabilityAdminService],
  exports: [ConsensusizabilityAdminService],
})
export class ConsensusizabilityModule {}
