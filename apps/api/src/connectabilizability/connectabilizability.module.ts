import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConnectabilizabilityAdminService } from './connectabilizability-admin.service.js'
import { ConnectabilizabilityController } from './connectabilizability.controller.js'
import { ConnectabilizabilityStatusService } from './connectabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConnectabilizabilityController],
  providers: [ConnectabilizabilityStatusService, ConnectabilizabilityAdminService],
  exports: [ConnectabilizabilityAdminService],
})
export class ConnectabilizabilityModule {}
