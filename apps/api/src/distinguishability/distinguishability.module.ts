import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DistinguishabilityAdminService } from './distinguishability-admin.service.js'
import { DistinguishabilityController } from './distinguishability.controller.js'
import { DistinguishabilityStatusService } from './distinguishability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DistinguishabilityController],
  providers: [DistinguishabilityStatusService, DistinguishabilityAdminService],
  exports: [DistinguishabilityAdminService],
})
export class DistinguishabilityModule {}
