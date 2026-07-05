import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CanonicalizabilityAdminService } from './canonicalizability-admin.service.js'
import { CanonicalizabilityController } from './canonicalizability.controller.js'
import { CanonicalizabilityStatusService } from './canonicalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CanonicalizabilityController],
  providers: [CanonicalizabilityStatusService, CanonicalizabilityAdminService],
  exports: [CanonicalizabilityAdminService],
})
export class CanonicalizabilityModule {}
