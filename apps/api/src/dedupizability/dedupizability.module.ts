import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DedupizabilityAdminService } from './dedupizability-admin.service.js'
import { DedupizabilityController } from './dedupizability.controller.js'
import { DedupizabilityStatusService } from './dedupizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DedupizabilityController],
  providers: [DedupizabilityStatusService, DedupizabilityAdminService],
  exports: [DedupizabilityAdminService],
})
export class DedupizabilityModule {}
