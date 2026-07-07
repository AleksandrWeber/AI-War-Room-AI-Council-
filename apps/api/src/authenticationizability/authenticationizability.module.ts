import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuthenticationizabilityAdminService } from './authenticationizability-admin.service.js'
import { AuthenticationizabilityController } from './authenticationizability.controller.js'
import { AuthenticationizabilityStatusService } from './authenticationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuthenticationizabilityController],
  providers: [AuthenticationizabilityStatusService, AuthenticationizabilityAdminService],
  exports: [AuthenticationizabilityAdminService],
})
export class AuthenticationizabilityModule {}
