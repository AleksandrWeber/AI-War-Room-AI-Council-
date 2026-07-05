import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IndexingizabilityAdminService } from './indexingizability-admin.service.js'
import { IndexingizabilityController } from './indexingizability.controller.js'
import { IndexingizabilityStatusService } from './indexingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IndexingizabilityController],
  providers: [IndexingizabilityStatusService, IndexingizabilityAdminService],
  exports: [IndexingizabilityAdminService],
})
export class IndexingizabilityModule {}
