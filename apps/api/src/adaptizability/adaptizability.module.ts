import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdaptizabilityAdminService } from './adaptizability-admin.service.js'
import { AdaptizabilityController } from './adaptizability.controller.js'
import { AdaptizabilityStatusService } from './adaptizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdaptizabilityController],
  providers: [AdaptizabilityStatusService, AdaptizabilityAdminService],
  exports: [AdaptizabilityAdminService],
})
export class AdaptizabilityModule {}
