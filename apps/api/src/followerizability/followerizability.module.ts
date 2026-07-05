import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FollowerizabilityAdminService } from './followerizability-admin.service.js'
import { FollowerizabilityController } from './followerizability.controller.js'
import { FollowerizabilityStatusService } from './followerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FollowerizabilityController],
  providers: [FollowerizabilityStatusService, FollowerizabilityAdminService],
  exports: [FollowerizabilityAdminService],
})
export class FollowerizabilityModule {}
