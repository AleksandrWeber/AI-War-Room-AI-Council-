import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LinkabilityvaultizabilityAdminService } from './linkabilityvaultizability-admin.service.js'
import { LinkabilityvaultizabilityController } from './linkabilityvaultizability.controller.js'
import { LinkabilityvaultizabilityStatusService } from './linkabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LinkabilityvaultizabilityController],
  providers: [LinkabilityvaultizabilityStatusService, LinkabilityvaultizabilityAdminService],
  exports: [LinkabilityvaultizabilityAdminService],
})
export class LinkabilityvaultizabilityModule {}
