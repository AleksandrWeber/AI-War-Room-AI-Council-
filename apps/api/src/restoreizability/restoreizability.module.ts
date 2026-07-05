import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RestoreizabilityAdminService } from './restoreizability-admin.service.js'
import { RestoreizabilityController } from './restoreizability.controller.js'
import { RestoreizabilityStatusService } from './restoreizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RestoreizabilityController],
  providers: [RestoreizabilityStatusService, RestoreizabilityAdminService],
  exports: [RestoreizabilityAdminService],
})
export class RestoreizabilityModule {}
