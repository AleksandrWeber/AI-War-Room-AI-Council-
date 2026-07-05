import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EpistemizabilityAdminService } from './epistemizability-admin.service.js'
import { EpistemizabilityController } from './epistemizability.controller.js'
import { EpistemizabilityStatusService } from './epistemizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EpistemizabilityController],
  providers: [EpistemizabilityStatusService, EpistemizabilityAdminService],
  exports: [EpistemizabilityAdminService],
})
export class EpistemizabilityModule {}
