import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RefreshizabilityAdminService } from './refreshizability-admin.service.js'
import { RefreshizabilityController } from './refreshizability.controller.js'
import { RefreshizabilityStatusService } from './refreshizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RefreshizabilityController],
  providers: [RefreshizabilityStatusService, RefreshizabilityAdminService],
  exports: [RefreshizabilityAdminService],
})
export class RefreshizabilityModule {}
