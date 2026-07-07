import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AutomatabilityvaultizabilityAdminService } from './automatabilityvaultizability-admin.service.js'
import { AutomatabilityvaultizabilityController } from './automatabilityvaultizability.controller.js'
import { AutomatabilityvaultizabilityStatusService } from './automatabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AutomatabilityvaultizabilityController],
  providers: [AutomatabilityvaultizabilityStatusService, AutomatabilityvaultizabilityAdminService],
  exports: [AutomatabilityvaultizabilityAdminService],
})
export class AutomatabilityvaultizabilityModule {}
