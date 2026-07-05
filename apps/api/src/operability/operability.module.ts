import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OperabilityAdminService } from './operability-admin.service.js'
import { OperabilityController } from './operability.controller.js'
import { OperabilityStatusService } from './operability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OperabilityController],
  providers: [OperabilityStatusService, OperabilityAdminService],
  exports: [OperabilityAdminService],
})
export class OperabilityModule {}
