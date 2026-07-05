import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FoldizabilityAdminService } from './foldizability-admin.service.js'
import { FoldizabilityController } from './foldizability.controller.js'
import { FoldizabilityStatusService } from './foldizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FoldizabilityController],
  providers: [FoldizabilityStatusService, FoldizabilityAdminService],
  exports: [FoldizabilityAdminService],
})
export class FoldizabilityModule {}
