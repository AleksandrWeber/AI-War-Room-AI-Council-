import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HardeningizabilityAdminService } from './hardeningizability-admin.service.js'
import { HardeningizabilityController } from './hardeningizability.controller.js'
import { HardeningizabilityStatusService } from './hardeningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HardeningizabilityController],
  providers: [HardeningizabilityStatusService, HardeningizabilityAdminService],
  exports: [HardeningizabilityAdminService],
})
export class HardeningizabilityModule {}
