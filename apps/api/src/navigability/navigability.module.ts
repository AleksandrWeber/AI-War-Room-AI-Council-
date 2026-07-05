import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NavigabilityAdminService } from './navigability-admin.service.js'
import { NavigabilityController } from './navigability.controller.js'
import { NavigabilityStatusService } from './navigability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NavigabilityController],
  providers: [NavigabilityStatusService, NavigabilityAdminService],
  exports: [NavigabilityAdminService],
})
export class NavigabilityModule {}
