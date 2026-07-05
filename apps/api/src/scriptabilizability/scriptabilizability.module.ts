import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScriptabilizabilityAdminService } from './scriptabilizability-admin.service.js'
import { ScriptabilizabilityController } from './scriptabilizability.controller.js'
import { ScriptabilizabilityStatusService } from './scriptabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScriptabilizabilityController],
  providers: [ScriptabilizabilityStatusService, ScriptabilizabilityAdminService],
  exports: [ScriptabilizabilityAdminService],
})
export class ScriptabilizabilityModule {}
