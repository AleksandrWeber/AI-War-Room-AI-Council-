import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProbabilizabilityAdminService } from './probabilizability-admin.service.js'
import { ProbabilizabilityController } from './probabilizability.controller.js'
import { ProbabilizabilityStatusService } from './probabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProbabilizabilityController],
  providers: [ProbabilizabilityStatusService, ProbabilizabilityAdminService],
  exports: [ProbabilizabilityAdminService],
})
export class ProbabilizabilityModule {}
