import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { JoinizabilityAdminService } from './joinizability-admin.service.js'
import { JoinizabilityController } from './joinizability.controller.js'
import { JoinizabilityStatusService } from './joinizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [JoinizabilityController],
  providers: [JoinizabilityStatusService, JoinizabilityAdminService],
  exports: [JoinizabilityAdminService],
})
export class JoinizabilityModule {}
