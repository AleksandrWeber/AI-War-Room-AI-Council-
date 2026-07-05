import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { UsabilityAdminService } from './usability-admin.service.js'
import { UsabilityController } from './usability.controller.js'
import { UsabilityStatusService } from './usability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [UsabilityController],
  providers: [UsabilityStatusService, UsabilityAdminService],
  exports: [UsabilityAdminService],
})
export class UsabilityModule {}
