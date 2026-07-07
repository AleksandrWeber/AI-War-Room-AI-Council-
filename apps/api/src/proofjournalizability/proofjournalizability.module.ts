import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProofjournalizabilityAdminService } from './proofjournalizability-admin.service.js'
import { ProofjournalizabilityController } from './proofjournalizability.controller.js'
import { ProofjournalizabilityStatusService } from './proofjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProofjournalizabilityController],
  providers: [ProofjournalizabilityStatusService, ProofjournalizabilityAdminService],
  exports: [ProofjournalizabilityAdminService],
})
export class ProofjournalizabilityModule {}
