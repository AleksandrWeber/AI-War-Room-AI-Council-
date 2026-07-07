import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompatibilityvaultizabilityAdminService } from './compatibilityvaultizability-admin.service.js'
import { CompatibilityvaultizabilityController } from './compatibilityvaultizability.controller.js'
import { CompatibilityvaultizabilityStatusService } from './compatibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompatibilityvaultizabilityController],
  providers: [CompatibilityvaultizabilityStatusService, CompatibilityvaultizabilityAdminService],
  exports: [CompatibilityvaultizabilityAdminService],
})
export class CompatibilityvaultizabilityModule {}
