import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RestorabilizabilityAdminService } from './restorabilizability-admin.service.js'
import { RestorabilizabilityController } from './restorabilizability.controller.js'
import { RestorabilizabilityStatusService } from './restorabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RestorabilizabilityController],
  providers: [RestorabilizabilityStatusService, RestorabilizabilityAdminService],
  exports: [RestorabilizabilityAdminService],
})
export class RestorabilizabilityModule {}
