import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InspectabilityvaultizabilityAdminService } from './inspectabilityvaultizability-admin.service.js'
import { InspectabilityvaultizabilityController } from './inspectabilityvaultizability.controller.js'
import { InspectabilityvaultizabilityStatusService } from './inspectabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InspectabilityvaultizabilityController],
  providers: [InspectabilityvaultizabilityStatusService, InspectabilityvaultizabilityAdminService],
  exports: [InspectabilityvaultizabilityAdminService],
})
export class InspectabilityvaultizabilityModule {}
