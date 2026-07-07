import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ModifiabilityvaultizabilityAdminService } from './modifiabilityvaultizability-admin.service.js'
import { ModifiabilityvaultizabilityController } from './modifiabilityvaultizability.controller.js'
import { ModifiabilityvaultizabilityStatusService } from './modifiabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ModifiabilityvaultizabilityController],
  providers: [ModifiabilityvaultizabilityStatusService, ModifiabilityvaultizabilityAdminService],
  exports: [ModifiabilityvaultizabilityAdminService],
})
export class ModifiabilityvaultizabilityModule {}
