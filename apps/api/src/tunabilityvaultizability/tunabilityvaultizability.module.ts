import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TunabilityvaultizabilityAdminService } from './tunabilityvaultizability-admin.service.js'
import { TunabilityvaultizabilityController } from './tunabilityvaultizability.controller.js'
import { TunabilityvaultizabilityStatusService } from './tunabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TunabilityvaultizabilityController],
  providers: [TunabilityvaultizabilityStatusService, TunabilityvaultizabilityAdminService],
  exports: [TunabilityvaultizabilityAdminService],
})
export class TunabilityvaultizabilityModule {}
