import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComparabilityvaultizabilityAdminService } from './comparabilityvaultizability-admin.service.js'
import { ComparabilityvaultizabilityController } from './comparabilityvaultizability.controller.js'
import { ComparabilityvaultizabilityStatusService } from './comparabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComparabilityvaultizabilityController],
  providers: [ComparabilityvaultizabilityStatusService, ComparabilityvaultizabilityAdminService],
  exports: [ComparabilityvaultizabilityAdminService],
})
export class ComparabilityvaultizabilityModule {}
