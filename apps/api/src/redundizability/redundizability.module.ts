import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RedundizabilityAdminService } from './redundizability-admin.service.js'
import { RedundizabilityController } from './redundizability.controller.js'
import { RedundizabilityStatusService } from './redundizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RedundizabilityController],
  providers: [RedundizabilityStatusService, RedundizabilityAdminService],
  exports: [RedundizabilityAdminService],
})
export class RedundizabilityModule {}
