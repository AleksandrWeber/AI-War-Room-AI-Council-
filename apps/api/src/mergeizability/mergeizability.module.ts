import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MergeizabilityAdminService } from './mergeizability-admin.service.js'
import { MergeizabilityController } from './mergeizability.controller.js'
import { MergeizabilityStatusService } from './mergeizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MergeizabilityController],
  providers: [MergeizabilityStatusService, MergeizabilityAdminService],
  exports: [MergeizabilityAdminService],
})
export class MergeizabilityModule {}
