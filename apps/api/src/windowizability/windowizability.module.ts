import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WindowizabilityAdminService } from './windowizability-admin.service.js'
import { WindowizabilityController } from './windowizability.controller.js'
import { WindowizabilityStatusService } from './windowizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WindowizabilityController],
  providers: [WindowizabilityStatusService, WindowizabilityAdminService],
  exports: [WindowizabilityAdminService],
})
export class WindowizabilityModule {}
