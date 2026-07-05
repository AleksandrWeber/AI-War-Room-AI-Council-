import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TunabilityAdminService } from './tunability-admin.service.js'
import { TunabilityController } from './tunability.controller.js'
import { TunabilityStatusService } from './tunability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TunabilityController],
  providers: [TunabilityStatusService, TunabilityAdminService],
  exports: [TunabilityAdminService],
})
export class TunabilityModule {}
