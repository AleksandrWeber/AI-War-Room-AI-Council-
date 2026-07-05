import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CollectizabilityAdminService } from './collectizability-admin.service.js'
import { CollectizabilityController } from './collectizability.controller.js'
import { CollectizabilityStatusService } from './collectizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CollectizabilityController],
  providers: [CollectizabilityStatusService, CollectizabilityAdminService],
  exports: [CollectizabilityAdminService],
})
export class CollectizabilityModule {}
