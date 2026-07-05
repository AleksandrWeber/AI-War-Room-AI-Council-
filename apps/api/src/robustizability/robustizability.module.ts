import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RobustizabilityAdminService } from './robustizability-admin.service.js'
import { RobustizabilityController } from './robustizability.controller.js'
import { RobustizabilityStatusService } from './robustizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RobustizabilityController],
  providers: [RobustizabilityStatusService, RobustizabilityAdminService],
  exports: [RobustizabilityAdminService],
})
export class RobustizabilityModule {}
