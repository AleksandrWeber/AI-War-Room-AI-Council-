import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TracejournalizabilityAdminService } from './tracejournalizability-admin.service.js'
import { TracejournalizabilityController } from './tracejournalizability.controller.js'
import { TracejournalizabilityStatusService } from './tracejournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TracejournalizabilityController],
  providers: [TracejournalizabilityStatusService, TracejournalizabilityAdminService],
  exports: [TracejournalizabilityAdminService],
})
export class TracejournalizabilityModule {}
