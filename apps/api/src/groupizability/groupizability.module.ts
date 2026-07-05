import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GroupizabilityAdminService } from './groupizability-admin.service.js'
import { GroupizabilityController } from './groupizability.controller.js'
import { GroupizabilityStatusService } from './groupizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GroupizabilityController],
  providers: [GroupizabilityStatusService, GroupizabilityAdminService],
  exports: [GroupizabilityAdminService],
})
export class GroupizabilityModule {}
