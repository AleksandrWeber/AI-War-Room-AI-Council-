import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TrustizabilityAdminService } from './trustizability-admin.service.js'
import { TrustizabilityController } from './trustizability.controller.js'
import { TrustizabilityStatusService } from './trustizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TrustizabilityController],
  providers: [TrustizabilityStatusService, TrustizabilityAdminService],
  exports: [TrustizabilityAdminService],
})
export class TrustizabilityModule {}
