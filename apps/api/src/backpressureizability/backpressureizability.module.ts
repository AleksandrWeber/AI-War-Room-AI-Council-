import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BackpressureizabilityAdminService } from './backpressureizability-admin.service.js'
import { BackpressureizabilityController } from './backpressureizability.controller.js'
import { BackpressureizabilityStatusService } from './backpressureizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BackpressureizabilityController],
  providers: [BackpressureizabilityStatusService, BackpressureizabilityAdminService],
  exports: [BackpressureizabilityAdminService],
})
export class BackpressureizabilityModule {}
