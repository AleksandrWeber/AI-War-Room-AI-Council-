import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DistributizabilityAdminService } from './distributizability-admin.service.js'
import { DistributizabilityController } from './distributizability.controller.js'
import { DistributizabilityStatusService } from './distributizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DistributizabilityController],
  providers: [DistributizabilityStatusService, DistributizabilityAdminService],
  exports: [DistributizabilityAdminService],
})
export class DistributizabilityModule {}
