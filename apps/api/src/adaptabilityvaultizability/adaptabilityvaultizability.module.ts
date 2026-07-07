import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdaptabilityvaultizabilityAdminService } from './adaptabilityvaultizability-admin.service.js'
import { AdaptabilityvaultizabilityController } from './adaptabilityvaultizability.controller.js'
import { AdaptabilityvaultizabilityStatusService } from './adaptabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdaptabilityvaultizabilityController],
  providers: [AdaptabilityvaultizabilityStatusService, AdaptabilityvaultizabilityAdminService],
  exports: [AdaptabilityvaultizabilityAdminService],
})
export class AdaptabilityvaultizabilityModule {}
