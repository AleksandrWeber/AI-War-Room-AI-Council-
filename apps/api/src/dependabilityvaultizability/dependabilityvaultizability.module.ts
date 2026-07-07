import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DependabilityvaultizabilityAdminService } from './dependabilityvaultizability-admin.service.js'
import { DependabilityvaultizabilityController } from './dependabilityvaultizability.controller.js'
import { DependabilityvaultizabilityStatusService } from './dependabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DependabilityvaultizabilityController],
  providers: [DependabilityvaultizabilityStatusService, DependabilityvaultizabilityAdminService],
  exports: [DependabilityvaultizabilityAdminService],
})
export class DependabilityvaultizabilityModule {}
