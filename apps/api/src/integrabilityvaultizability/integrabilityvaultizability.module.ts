import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrabilityvaultizabilityAdminService } from './integrabilityvaultizability-admin.service.js'
import { IntegrabilityvaultizabilityController } from './integrabilityvaultizability.controller.js'
import { IntegrabilityvaultizabilityStatusService } from './integrabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrabilityvaultizabilityController],
  providers: [IntegrabilityvaultizabilityStatusService, IntegrabilityvaultizabilityAdminService],
  exports: [IntegrabilityvaultizabilityAdminService],
})
export class IntegrabilityvaultizabilityModule {}
