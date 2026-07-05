import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LocatabilityAdminService } from './locatability-admin.service.js'
import { LocatabilityController } from './locatability.controller.js'
import { LocatabilityStatusService } from './locatability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LocatabilityController],
  providers: [LocatabilityStatusService, LocatabilityAdminService],
  exports: [LocatabilityAdminService],
})
export class LocatabilityModule {}
