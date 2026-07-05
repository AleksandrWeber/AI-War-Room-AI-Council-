import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NormalizabilityAdminService } from './normalizability-admin.service.js'
import { NormalizabilityController } from './normalizability.controller.js'
import { NormalizabilityStatusService } from './normalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NormalizabilityController],
  providers: [NormalizabilityStatusService, NormalizabilityAdminService],
  exports: [NormalizabilityAdminService],
})
export class NormalizabilityModule {}
