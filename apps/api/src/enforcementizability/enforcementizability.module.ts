import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EnforcementizabilityAdminService } from './enforcementizability-admin.service.js'
import { EnforcementizabilityController } from './enforcementizability.controller.js'
import { EnforcementizabilityStatusService } from './enforcementizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EnforcementizabilityController],
  providers: [EnforcementizabilityStatusService, EnforcementizabilityAdminService],
  exports: [EnforcementizabilityAdminService],
})
export class EnforcementizabilityModule {}
