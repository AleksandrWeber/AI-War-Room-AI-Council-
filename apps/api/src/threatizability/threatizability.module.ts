import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ThreatizabilityAdminService } from './threatizability-admin.service.js'
import { ThreatizabilityController } from './threatizability.controller.js'
import { ThreatizabilityStatusService } from './threatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ThreatizabilityController],
  providers: [ThreatizabilityStatusService, ThreatizabilityAdminService],
  exports: [ThreatizabilityAdminService],
})
export class ThreatizabilityModule {}
