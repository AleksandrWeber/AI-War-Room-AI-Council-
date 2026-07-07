import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MitigationizabilityAdminService } from './mitigationizability-admin.service.js'
import { MitigationizabilityController } from './mitigationizability.controller.js'
import { MitigationizabilityStatusService } from './mitigationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MitigationizabilityController],
  providers: [MitigationizabilityStatusService, MitigationizabilityAdminService],
  exports: [MitigationizabilityAdminService],
})
export class MitigationizabilityModule {}
