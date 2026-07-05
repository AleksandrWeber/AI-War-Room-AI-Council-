import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IndexizabilityAdminService } from './indexizability-admin.service.js'
import { IndexizabilityController } from './indexizability.controller.js'
import { IndexizabilityStatusService } from './indexizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IndexizabilityController],
  providers: [IndexizabilityStatusService, IndexizabilityAdminService],
  exports: [IndexizabilityAdminService],
})
export class IndexizabilityModule {}
