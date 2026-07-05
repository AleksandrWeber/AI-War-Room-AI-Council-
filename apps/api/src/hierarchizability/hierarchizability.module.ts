import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HierarchizabilityAdminService } from './hierarchizability-admin.service.js'
import { HierarchizabilityController } from './hierarchizability.controller.js'
import { HierarchizabilityStatusService } from './hierarchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HierarchizabilityController],
  providers: [HierarchizabilityStatusService, HierarchizabilityAdminService],
  exports: [HierarchizabilityAdminService],
})
export class HierarchizabilityModule {}
