import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NavigabilityvaultizabilityAdminService } from './navigabilityvaultizability-admin.service.js'
import { NavigabilityvaultizabilityController } from './navigabilityvaultizability.controller.js'
import { NavigabilityvaultizabilityStatusService } from './navigabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NavigabilityvaultizabilityController],
  providers: [NavigabilityvaultizabilityStatusService, NavigabilityvaultizabilityAdminService],
  exports: [NavigabilityvaultizabilityAdminService],
})
export class NavigabilityvaultizabilityModule {}
