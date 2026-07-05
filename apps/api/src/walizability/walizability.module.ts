import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WalizabilityAdminService } from './walizability-admin.service.js'
import { WalizabilityController } from './walizability.controller.js'
import { WalizabilityStatusService } from './walizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WalizabilityController],
  providers: [WalizabilityStatusService, WalizabilityAdminService],
  exports: [WalizabilityAdminService],
})
export class WalizabilityModule {}
