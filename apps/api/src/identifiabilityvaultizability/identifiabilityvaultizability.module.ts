import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IdentifiabilityvaultizabilityAdminService } from './identifiabilityvaultizability-admin.service.js'
import { IdentifiabilityvaultizabilityController } from './identifiabilityvaultizability.controller.js'
import { IdentifiabilityvaultizabilityStatusService } from './identifiabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IdentifiabilityvaultizabilityController],
  providers: [IdentifiabilityvaultizabilityStatusService, IdentifiabilityvaultizabilityAdminService],
  exports: [IdentifiabilityvaultizabilityAdminService],
})
export class IdentifiabilityvaultizabilityModule {}
