import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DiscoverabilityvaultizabilityAdminService } from './discoverabilityvaultizability-admin.service.js'
import { DiscoverabilityvaultizabilityController } from './discoverabilityvaultizability.controller.js'
import { DiscoverabilityvaultizabilityStatusService } from './discoverabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DiscoverabilityvaultizabilityController],
  providers: [DiscoverabilityvaultizabilityStatusService, DiscoverabilityvaultizabilityAdminService],
  exports: [DiscoverabilityvaultizabilityAdminService],
})
export class DiscoverabilityvaultizabilityModule {}
