import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SchedulabilityvaultizabilityAdminService } from './schedulabilityvaultizability-admin.service.js'
import { SchedulabilityvaultizabilityController } from './schedulabilityvaultizability.controller.js'
import { SchedulabilityvaultizabilityStatusService } from './schedulabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SchedulabilityvaultizabilityController],
  providers: [SchedulabilityvaultizabilityStatusService, SchedulabilityvaultizabilityAdminService],
  exports: [SchedulabilityvaultizabilityAdminService],
})
export class SchedulabilityvaultizabilityModule {}
