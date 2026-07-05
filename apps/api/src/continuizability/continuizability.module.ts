import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ContinuizabilityAdminService } from './continuizability-admin.service.js'
import { ContinuizabilityController } from './continuizability.controller.js'
import { ContinuizabilityStatusService } from './continuizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ContinuizabilityController],
  providers: [ContinuizabilityStatusService, ContinuizabilityAdminService],
  exports: [ContinuizabilityAdminService],
})
export class ContinuizabilityModule {}
