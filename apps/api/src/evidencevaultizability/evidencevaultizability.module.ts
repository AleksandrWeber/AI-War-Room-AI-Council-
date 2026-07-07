import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvidencevaultizabilityAdminService } from './evidencevaultizability-admin.service.js'
import { EvidencevaultizabilityController } from './evidencevaultizability.controller.js'
import { EvidencevaultizabilityStatusService } from './evidencevaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvidencevaultizabilityController],
  providers: [EvidencevaultizabilityStatusService, EvidencevaultizabilityAdminService],
  exports: [EvidencevaultizabilityAdminService],
})
export class EvidencevaultizabilityModule {}
