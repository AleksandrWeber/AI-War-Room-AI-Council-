import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IdentityproofizabilityAdminService } from './identityproofizability-admin.service.js'
import { IdentityproofizabilityController } from './identityproofizability.controller.js'
import { IdentityproofizabilityStatusService } from './identityproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IdentityproofizabilityController],
  providers: [IdentityproofizabilityStatusService, IdentityproofizabilityAdminService],
  exports: [IdentityproofizabilityAdminService],
})
export class IdentityproofizabilityModule {}
