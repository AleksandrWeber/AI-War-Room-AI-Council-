import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ThrottleizabilityAdminService } from './throttleizability-admin.service.js'
import { ThrottleizabilityController } from './throttleizability.controller.js'
import { ThrottleizabilityStatusService } from './throttleizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ThrottleizabilityController],
  providers: [ThrottleizabilityStatusService, ThrottleizabilityAdminService],
  exports: [ThrottleizabilityAdminService],
})
export class ThrottleizabilityModule {}
