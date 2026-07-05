import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExpandizabilityAdminService } from './expandizability-admin.service.js'
import { ExpandizabilityController } from './expandizability.controller.js'
import { ExpandizabilityStatusService } from './expandizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExpandizabilityController],
  providers: [ExpandizabilityStatusService, ExpandizabilityAdminService],
  exports: [ExpandizabilityAdminService],
})
export class ExpandizabilityModule {}
