import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SecurityizabilityAdminService } from './securityizability-admin.service.js'
import { SecurityizabilityController } from './securityizability.controller.js'
import { SecurityizabilityStatusService } from './securityizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SecurityizabilityController],
  providers: [SecurityizabilityStatusService, SecurityizabilityAdminService],
  exports: [SecurityizabilityAdminService],
})
export class SecurityizabilityModule {}
