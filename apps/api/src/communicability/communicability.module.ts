import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CommunicabilityAdminService } from './communicability-admin.service.js'
import { CommunicabilityController } from './communicability.controller.js'
import { CommunicabilityStatusService } from './communicability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CommunicabilityController],
  providers: [CommunicabilityStatusService, CommunicabilityAdminService],
  exports: [CommunicabilityAdminService],
})
export class CommunicabilityModule {}
