import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GeneralizabilityAdminService } from './generalizability-admin.service.js'
import { GeneralizabilityController } from './generalizability.controller.js'
import { GeneralizabilityStatusService } from './generalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GeneralizabilityController],
  providers: [GeneralizabilityStatusService, GeneralizabilityAdminService],
  exports: [GeneralizabilityAdminService],
})
export class GeneralizabilityModule {}
