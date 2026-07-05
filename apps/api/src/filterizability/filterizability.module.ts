import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FilterizabilityAdminService } from './filterizability-admin.service.js'
import { FilterizabilityController } from './filterizability.controller.js'
import { FilterizabilityStatusService } from './filterizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FilterizabilityController],
  providers: [FilterizabilityStatusService, FilterizabilityAdminService],
  exports: [FilterizabilityAdminService],
})
export class FilterizabilityModule {}
