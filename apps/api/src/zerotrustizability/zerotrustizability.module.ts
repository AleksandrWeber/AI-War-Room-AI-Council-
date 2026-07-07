import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ZerotrustizabilityAdminService } from './zerotrustizability-admin.service.js'
import { ZerotrustizabilityController } from './zerotrustizability.controller.js'
import { ZerotrustizabilityStatusService } from './zerotrustizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ZerotrustizabilityController],
  providers: [ZerotrustizabilityStatusService, ZerotrustizabilityAdminService],
  exports: [ZerotrustizabilityAdminService],
})
export class ZerotrustizabilityModule {}
