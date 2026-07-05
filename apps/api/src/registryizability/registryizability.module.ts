import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistryizabilityAdminService } from './registryizability-admin.service.js'
import { RegistryizabilityController } from './registryizability.controller.js'
import { RegistryizabilityStatusService } from './registryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistryizabilityController],
  providers: [RegistryizabilityStatusService, RegistryizabilityAdminService],
  exports: [RegistryizabilityAdminService],
})
export class RegistryizabilityModule {}
