import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComposabilityvaultizabilityAdminService } from './composabilityvaultizability-admin.service.js'
import { ComposabilityvaultizabilityController } from './composabilityvaultizability.controller.js'
import { ComposabilityvaultizabilityStatusService } from './composabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComposabilityvaultizabilityController],
  providers: [ComposabilityvaultizabilityStatusService, ComposabilityvaultizabilityAdminService],
  exports: [ComposabilityvaultizabilityAdminService],
})
export class ComposabilityvaultizabilityModule {}
