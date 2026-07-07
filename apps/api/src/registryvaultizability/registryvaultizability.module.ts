import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistryvaultizabilityAdminService } from './registryvaultizability-admin.service.js'
import { RegistryvaultizabilityController } from './registryvaultizability.controller.js'
import { RegistryvaultizabilityStatusService } from './registryvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistryvaultizabilityController],
  providers: [RegistryvaultizabilityStatusService, RegistryvaultizabilityAdminService],
  exports: [RegistryvaultizabilityAdminService],
})
export class RegistryvaultizabilityModule {}
