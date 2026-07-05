import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConnectabilityAdminService } from './connectability-admin.service.js'
import { ConnectabilityController } from './connectability.controller.js'
import { ConnectabilityStatusService } from './connectability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConnectabilityController],
  providers: [ConnectabilityStatusService, ConnectabilityAdminService],
  exports: [ConnectabilityAdminService],
})
export class ConnectabilityModule {}
