import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DemonstrabilityvaultizabilityAdminService } from './demonstrabilityvaultizability-admin.service.js'
import { DemonstrabilityvaultizabilityController } from './demonstrabilityvaultizability.controller.js'
import { DemonstrabilityvaultizabilityStatusService } from './demonstrabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DemonstrabilityvaultizabilityController],
  providers: [DemonstrabilityvaultizabilityStatusService, DemonstrabilityvaultizabilityAdminService],
  exports: [DemonstrabilityvaultizabilityAdminService],
})
export class DemonstrabilityvaultizabilityModule {}
