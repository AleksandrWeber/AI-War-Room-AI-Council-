import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MaintainabilizabilityAdminService } from './maintainabilizability-admin.service.js'
import { MaintainabilizabilityController } from './maintainabilizability.controller.js'
import { MaintainabilizabilityStatusService } from './maintainabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MaintainabilizabilityController],
  providers: [MaintainabilizabilityStatusService, MaintainabilizabilityAdminService],
  exports: [MaintainabilizabilityAdminService],
})
export class MaintainabilizabilityModule {}
