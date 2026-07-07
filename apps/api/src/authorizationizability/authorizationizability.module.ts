import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuthorizationizabilityAdminService } from './authorizationizability-admin.service.js'
import { AuthorizationizabilityController } from './authorizationizability.controller.js'
import { AuthorizationizabilityStatusService } from './authorizationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuthorizationizabilityController],
  providers: [AuthorizationizabilityStatusService, AuthorizationizabilityAdminService],
  exports: [AuthorizationizabilityAdminService],
})
export class AuthorizationizabilityModule {}
