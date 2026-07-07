import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttributabilityvaultizabilityAdminService } from './attributabilityvaultizability-admin.service.js'
import { AttributabilityvaultizabilityController } from './attributabilityvaultizability.controller.js'
import { AttributabilityvaultizabilityStatusService } from './attributabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttributabilityvaultizabilityController],
  providers: [AttributabilityvaultizabilityStatusService, AttributabilityvaultizabilityAdminService],
  exports: [AttributabilityvaultizabilityAdminService],
})
export class AttributabilityvaultizabilityModule {}
