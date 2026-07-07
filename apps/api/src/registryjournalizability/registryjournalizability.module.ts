import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistryjournalizabilityAdminService } from './registryjournalizability-admin.service.js'
import { RegistryjournalizabilityController } from './registryjournalizability.controller.js'
import { RegistryjournalizabilityStatusService } from './registryjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistryjournalizabilityController],
  providers: [RegistryjournalizabilityStatusService, RegistryjournalizabilityAdminService],
  exports: [RegistryjournalizabilityAdminService],
})
export class RegistryjournalizabilityModule {}
