import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistrationizabilityAdminService } from './registrationizability-admin.service.js'
import { RegistrationizabilityController } from './registrationizability.controller.js'
import { RegistrationizabilityStatusService } from './registrationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistrationizabilityController],
  providers: [RegistrationizabilityStatusService, RegistrationizabilityAdminService],
  exports: [RegistrationizabilityAdminService],
})
export class RegistrationizabilityModule {}
