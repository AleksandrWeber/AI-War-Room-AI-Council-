import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeterminizabilityAdminService } from './determinizability-admin.service.js'
import { DeterminizabilityController } from './determinizability.controller.js'
import { DeterminizabilityStatusService } from './determinizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeterminizabilityController],
  providers: [DeterminizabilityStatusService, DeterminizabilityAdminService],
  exports: [DeterminizabilityAdminService],
})
export class DeterminizabilityModule {}
