import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PrefetchizabilityAdminService } from './prefetchizability-admin.service.js'
import { PrefetchizabilityController } from './prefetchizability.controller.js'
import { PrefetchizabilityStatusService } from './prefetchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PrefetchizabilityController],
  providers: [PrefetchizabilityStatusService, PrefetchizabilityAdminService],
  exports: [PrefetchizabilityAdminService],
})
export class PrefetchizabilityModule {}
