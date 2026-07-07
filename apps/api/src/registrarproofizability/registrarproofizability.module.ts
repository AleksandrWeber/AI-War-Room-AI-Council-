import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistrarproofizabilityAdminService } from './registrarproofizability-admin.service.js'
import { RegistrarproofizabilityController } from './registrarproofizability.controller.js'
import { RegistrarproofizabilityStatusService } from './registrarproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistrarproofizabilityController],
  providers: [RegistrarproofizabilityStatusService, RegistrarproofizabilityAdminService],
  exports: [RegistrarproofizabilityAdminService],
})
export class RegistrarproofizabilityModule {}
