import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegressizabilityAdminService } from './regressizability-admin.service.js'
import { RegressizabilityController } from './regressizability.controller.js'
import { RegressizabilityStatusService } from './regressizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegressizabilityController],
  providers: [RegressizabilityStatusService, RegressizabilityAdminService],
  exports: [RegressizabilityAdminService],
})
export class RegressizabilityModule {}
