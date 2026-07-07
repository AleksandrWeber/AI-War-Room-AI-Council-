import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RetrievabilityvaultizabilityAdminService } from './retrievabilityvaultizability-admin.service.js'
import { RetrievabilityvaultizabilityController } from './retrievabilityvaultizability.controller.js'
import { RetrievabilityvaultizabilityStatusService } from './retrievabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RetrievabilityvaultizabilityController],
  providers: [RetrievabilityvaultizabilityStatusService, RetrievabilityvaultizabilityAdminService],
  exports: [RetrievabilityvaultizabilityAdminService],
})
export class RetrievabilityvaultizabilityModule {}
